import os
import json
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import auth

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google import genai
from google.cloud import firestore
from google.cloud import secretmanager


# ============================================================
# Firebase initialization
# ============================================================

if not firebase_admin._apps:
    firebase_admin.initialize_app()


# ============================================================
# Google Cloud clients
# ============================================================

db = firestore.Client()
secret_client = secretmanager.SecretManagerServiceClient()


# ============================================================
# Project configuration
# ============================================================

PROJECT_ID = os.environ.get(
    "GOOGLE_CLOUD_PROJECT",
    "personal-gemini-journal-507016"
)

SECRET_NAME = (
    f"projects/{PROJECT_ID}/secrets/"
    "GEMINI_API_KEY/versions/latest"
)


# ============================================================
# Gemini API key from Secret Manager
# ============================================================

def get_gemini_api_key():

    response = secret_client.access_secret_version(
        request={
            "name": SECRET_NAME
        }
    )

    return response.payload.data.decode("UTF-8").strip()


# ============================================================
# Gemini client
# ============================================================

client = genai.Client(
    api_key=get_gemini_api_key()
)


# ============================================================
# FastAPI application
# ============================================================

app = FastAPI(
    title="Personal Gemini Journal API",
    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Request model
# ============================================================

class JournalRequest(BaseModel):
    message: str


# ============================================================
# Firebase authentication
# ============================================================

def verify_user(authorization: str | None):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header"
        )

    token = authorization.split(" ", 1)[1]

    try:

        decoded_token = auth.verify_id_token(token)

        return decoded_token["uid"]

    except Exception as e:

        print(
            f"Firebase authentication error: {e}"
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )


# ============================================================
# Health check
# ============================================================

@app.get("/")
def health_check():

    return {
        "status": "ok",
        "service": "Personal Gemini Journal API"
    }


# ============================================================
# Journal endpoint
# ============================================================

@app.post("/journal")
def create_journal(
    request: JournalRequest,
    authorization: str | None = Header(default=None)
):

    # --------------------------------------------------------
    # Authenticate user
    # --------------------------------------------------------

    uid = verify_user(authorization)

    # --------------------------------------------------------
    # Generate Gemini response
    # --------------------------------------------------------

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=request.message
        )

        ai_response = response.text

    except Exception as e:

        print(
            f"Gemini error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate AI response"
        )

    # --------------------------------------------------------
    # Store journal under authenticated user's UID
    # --------------------------------------------------------

    journal_ref = (
        db.collection("users")
        .document(uid)
        .collection("journals")
        .document()
    )

    journal_ref.set({

        "userId": uid,

        "userMessage": request.message,

        "aiResponse": ai_response,

        "createdAt": datetime.now(timezone.utc)
    })

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {

        "response": ai_response,

        "journalId": journal_ref.id
    }


# ============================================================
# PERSONAL AI INSIGHTS
# ============================================================

@app.get("/insights")
def generate_insights(
    authorization: str | None = Header(default=None)
):

    # --------------------------------------------------------
    # Authenticate user
    # --------------------------------------------------------

    uid = verify_user(authorization)

    # --------------------------------------------------------
    # Get ONLY authenticated user's journals
    # --------------------------------------------------------

    try:

        journals_ref = (
            db.collection("users")
            .document(uid)
            .collection("journals")
            .order_by(
                "createdAt",
                direction=firestore.Query.DESCENDING
            )
            .limit(20)
        )

        journals = []

        for doc in journals_ref.stream():

            data = doc.to_dict()

            journals.append({

                "userMessage": data.get(
                    "userMessage",
                    ""
                ),

                "aiResponse": data.get(
                    "aiResponse",
                    ""
                ),

                "createdAt": str(
                    data.get(
                        "createdAt",
                        ""
                    )
                )
            })

    except Exception as e:

        print(
            f"Firestore insights error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve journal entries"
        )

    # --------------------------------------------------------
    # No journals
    # --------------------------------------------------------

    if not journals:

        return {

            "insights": None,

            "message":
                "Write a few journal entries first "
                "to generate insights."
        }

    # --------------------------------------------------------
    # Prepare journal text
    # --------------------------------------------------------

    journal_text = ""

    for index, journal in enumerate(
        journals,
        start=1
    ):

        journal_text += f"""

Journal {index}

Date:
{journal["createdAt"]}

User:
{journal["userMessage"]}

Gemini:
{journal["aiResponse"]}

--------------------------------
"""

    # --------------------------------------------------------
    # Gemini insights prompt
    # --------------------------------------------------------

    prompt = f"""

You are a thoughtful personal journaling assistant.

Analyze the following journal entries belonging
to ONE authenticated user.

Identify meaningful patterns without making
medical diagnoses or unsupported assumptions.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "summary": "A short overall reflection",
    "topThemes": [
        "theme 1",
        "theme 2",
        "theme 3"
    ],
    "mood": "Positive / Neutral / Mixed / Challenging",
    "recurringThoughts": "A short description of recurring thoughts or concerns",
    "growthAreas": [
        "growth area 1",
        "growth area 2"
    ],
    "reflection": "A thoughtful personalized reflection",
    "nextStep": "One practical next step for the user"
}}

Rules:

- Keep the response concise.
- Be supportive.
- Do not diagnose the user.
- Do not make unsupported claims.
- Focus only on patterns visible in the journal entries.
- Return valid JSON only.

Journal entries:

{journal_text}

"""

    # --------------------------------------------------------
    # Generate insights
    # --------------------------------------------------------

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        raw_text = response.text.strip()

        # Remove markdown code fences if present

        if raw_text.startswith("```"):

            raw_text = raw_text.replace(
                "```json",
                ""
            )

            raw_text = raw_text.replace(
                "```",
                ""
            )

            raw_text = raw_text.strip()

        insights = json.loads(raw_text)

    except Exception as e:

        print(
            f"Insights Gemini error: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate insights"
        )

    # --------------------------------------------------------
    # Return insights
    # --------------------------------------------------------

    return {

        "insights": insights,

        "journalCount": len(journals)
    }