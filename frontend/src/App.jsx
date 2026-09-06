import { useState } from "react";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";


function App() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [user, setUser] = useState(null);

  const [message, setMessage] = useState("");

  const [response, setResponse] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [insights, setInsights] = useState(null);

  const [insightsLoading, setInsightsLoading] =
    useState(false);

  const [showInsights, setShowInsights] =
    useState(false);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLogin = async () => {

    try {

      setError("");

      const provider =
        new GoogleAuthProvider();

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      setUser(result.user);

    } catch (err) {

      console.error(err);

      setError(
        "Login failed. Please try again."
      );
    }
  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {

    await signOut(auth);

    setUser(null);

    setResponse("");

    setMessage("");

    setInsights(null);

    setShowInsights(false);

    setError("");
  };


  // ==========================================================
  // TALK TO GEMINI
  // ==========================================================

  const sendJournal = async () => {

    if (!message.trim()) {
      return;
    }

    try {

      setLoading(true);

      setError("");

      setResponse("");

      const token =
        await user.getIdToken();

      const result = await fetch(
        "https://personal-gemini-journal-api-66l4p2aomq-em.a.run.app/journal",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: message,
          }),
        }
      );

      const data =
        await result.json();

      if (!result.ok) {

        throw new Error(
          data.detail ||
          "Request failed"
        );
      }

      setResponse(
        data.response
      );

      setMessage("");

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to contact Gemini."
      );

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // GET PERSONAL INSIGHTS
  // ==========================================================

  const getInsights = async () => {

    try {

      setInsightsLoading(true);

      setError("");

      setShowInsights(true);

      const token =
        await user.getIdToken();

      const result = await fetch(
        "https://personal-gemini-journal-api-66l4p2aomq-em.a.run.app/insights",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await result.json();

      if (!result.ok) {

        throw new Error(
          data.detail ||
          "Unable to generate insights"
        );
      }

      setInsights(data);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to generate insights."
      );

    } finally {

      setInsightsLoading(false);
    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <>

      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
        }

        body {
          font-family:
            Inter,
            Arial,
            sans-serif;

          background: #070719;

          color: white;
        }

        button,
        textarea {
          font-family: inherit;
        }


        /* ====================================================
           APP
        ==================================================== */

        .app {

          width: 100%;

          min-height: 100vh;

          padding:
            40px
            24px
            30px;

          overflow-x: hidden;

          background:

            radial-gradient(
              circle at 10% 5%,
              rgba(168, 85, 247, 0.28),
              transparent 25%
            ),

            radial-gradient(
              circle at 90% 15%,
              rgba(6, 182, 212, 0.20),
              transparent 25%
            ),

            radial-gradient(
              circle at 50% 95%,
              rgba(236, 72, 153, 0.18),
              transparent 30%
            ),

            #070719;
        }


        .container {

          width: 100%;

          max-width: 1100px;

          margin: 0 auto;
        }


        /* ====================================================
           HEADER
        ==================================================== */

        .header {

          width: 100%;

          text-align: center;

          margin-bottom: 32px;
        }


        .sparkle {

          font-size: 46px;

          line-height: 1;

          margin-bottom: 8px;

          animation:
            float 3s ease-in-out infinite;

          filter:
            drop-shadow(
              0 0 8px #ec4899
            )
            drop-shadow(
              0 0 15px #8b5cf6
            );
        }


        @keyframes float {

          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-7px);
          }
        }


        .title {

          width: 100%;

          margin: 0 auto;

          padding: 0 5px;

          font-size:
            clamp(
              32px,
              5vw,
              58px
            );

          line-height: 1.15;

          font-weight: 800;

          letter-spacing: -1.5px;

          text-align: center;

          background:
            linear-gradient(
              90deg,
              #ec4899 0%,
              #a855f7 30%,
              #22d3ee 65%,
              #facc15 100%
            );

          -webkit-background-clip: text;

          background-clip: text;

          color: transparent;
        }


        .subtitle {

          margin:
            10px
            0
            18px;

          color: #b8b8d0;

          font-size: 16px;
        }


        .gradient-line {

          width: 150px;

          height: 4px;

          margin: auto;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #ec4899,
              #8b5cf6,
              #22d3ee,
              #facc15
            );

          box-shadow:
            0 0 10px #ec4899,
            0 0 18px
            rgba(
              168,
              85,
              247,
              0.7
            );
        }


        /* ====================================================
           USER BAR
        ==================================================== */

        .user-bar {

          display: flex;

          align-items: center;

          justify-content: center;

          flex-wrap: wrap;

          gap: 10px;

          margin-top: 22px;

          padding:
            9px
            12px
            9px
            15px;

          border:
            1px solid
            rgba(
              34,
              211,
              238,
              0.45
            );

          border-radius: 40px;

          background:
            rgba(
              20,
              20,
              45,
              0.9
            );

          box-shadow:
            0 0 25px
            rgba(
              34,
              211,
              238,
              0.08
            );

          color: #ddddee;

          font-size: 14px;
        }


        .online-dot {

          width: 9px;

          height: 9px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 10px #22c55e;
        }


        .logout {

          border: 0;

          border-radius: 20px;

          padding:
            8px
            15px;

          background:
            linear-gradient(
              135deg,
              #a855f7,
              #ec4899
            );

          color: white;

          font-weight: 600;

          cursor: pointer;

          transition:
            0.2s ease;
        }


        .logout:hover {

          transform:
            translateY(-2px);

          box-shadow:
            0 5px 18px
            rgba(
              236,
              72,
              153,
              0.35
            );
        }


        /* ====================================================
           MAIN CARD
        ==================================================== */

        .card {

          position: relative;

          width: 100%;

          padding: 32px;

          border-radius: 25px;

          border:
            1px solid
            rgba(
              168,
              85,
              247,
              0.6
            );

          background:
            linear-gradient(
              145deg,
              rgba(
                23,
                23,
                55,
                0.97
              ),
              rgba(
                12,
                15,
                40,
                0.96
              )
            );

          box-shadow:
            0 20px 60px
            rgba(0, 0, 0, 0.45),

            0 0 40px
            rgba(
              139,
              92,
              246,
              0.08
            );
        }


        .card::before {

          content: "";

          position: absolute;

          top: 0;

          left: 10%;

          right: 10%;

          height: 2px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #ec4899,
              #22d3ee,
              transparent
            );
        }


        .section-title {

          margin: 0;

          font-size: 24px;

          display: flex;

          align-items: center;

          gap: 10px;
        }


        .hint {

          color: #9898b2;

          margin:
            9px
            0
            18px;

          font-size: 14px;
        }


        /* ====================================================
           TEXT AREA
        ==================================================== */

        textarea {

          display: block;

          width: 100%;

          min-height: 220px;

          resize: vertical;

          padding: 20px;

          border-radius: 18px;

          border:
            2px solid
            rgba(
              168,
              85,
              247,
              0.6
            );

          outline: none;

          background:
            linear-gradient(
              135deg,
              rgba(
                30,
                20,
                65,
                0.95
              ),
              rgba(
                15,
                28,
                60,
                0.95
              )
            );

          color: #f7f7ff;

          font-size: 16px;

          line-height: 1.7;

          box-shadow:
            inset 0 0 30px
            rgba(
              139,
              92,
              246,
              0.08
            );

          transition:
            0.25s ease;
        }


        textarea:focus {

          border-color:
            #22d3ee;

          box-shadow:

            0 0 0 3px
            rgba(
              34,
              211,
              238,
              0.1
            ),

            0 0 30px
            rgba(
              34,
              211,
              238,
              0.15
            );
        }


        textarea::placeholder {

          color: #777793;
        }


        /* ====================================================
           ACTION ROW
        ==================================================== */

        .bottom-row {

          margin-top: 17px;

          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 15px;
        }


        .tip {

          padding:
            11px
            15px;

          border-radius: 13px;

          background:
            rgba(
              168,
              85,
              247,
              0.13
            );

          border:
            1px solid
            rgba(
              168,
              85,
              247,
              0.35
            );

          color: #d8b4fe;

          font-size: 13px;
        }


        .counter {

          color: #777793;

          font-size: 12px;

          margin-left: auto;
        }


        .talk-btn {

          border: 0;

          padding:
            14px
            27px;

          border-radius: 14px;

          color: white;

          font-size: 15px;

          font-weight: 700;

          cursor: pointer;

          background:
            linear-gradient(
              135deg,
              #ec4899,
              #a855f7 45%,
              #f59e0b
            );

          box-shadow:
            0 8px 25px
            rgba(
              236,
              72,
              153,
              0.28
            ),

            0 0 20px
            rgba(
              168,
              85,
              247,
              0.18
            );

          transition:
            0.2s ease;
        }


        .talk-btn:hover:not(:disabled) {

          transform:
            translateY(-3px);

          box-shadow:
            0 12px 30px
            rgba(
              236,
              72,
              153,
              0.38
            ),

            0 0 30px
            rgba(
              168,
              85,
              247,
              0.25
            );
        }


        .talk-btn:disabled {

          opacity: 0.55;

          cursor: not-allowed;
        }


        /* ====================================================
           RESPONSE
        ==================================================== */

        .response {

          margin-top: 25px;

          padding: 22px;

          border-radius: 20px;

          border:
            1px solid
            rgba(
              16,
              185,
              129,
              0.55
            );

          background:
            linear-gradient(
              135deg,
              rgba(
                5,
                45,
                48,
                0.85
              ),
              rgba(
                7,
                35,
                48,
                0.85
              )
            );
        }


        .response-title {

          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 10px;

          margin-bottom: 16px;

          color: #5eead4;

          font-weight: 700;

          font-size: 19px;
        }


        .ai-icon {

          width: 36px;

          height: 36px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #22d3ee
            );
        }


        .ai-badge {

          font-size: 11px;

          padding:
            5px
            9px;

          border-radius: 20px;

          background:
            rgba(
              16,
              185,
              129,
              0.13
            );

          border:
            1px solid
            rgba(
              16,
              185,
              129,
              0.3
            );

          color: #6ee7b7;
        }


        .response-text {

          padding: 19px;

          border-radius: 15px;

          background:
            rgba(
              5,
              20,
              30,
              0.68
            );

          color: #d9fdf4;

          line-height: 1.75;

          white-space: pre-wrap;

          font-size: 15px;
        }


        /* ====================================================
           INSIGHTS
        ==================================================== */

        .insights {

          margin-top: 28px;

          padding: 25px;

          border-radius: 22px;

          border:
            1px solid
            rgba(
              168,
              85,
              247,
              0.55
            );

          background:
            linear-gradient(
              135deg,
              rgba(
                30,
                20,
                65,
                0.95
              ),
              rgba(
                10,
                25,
                55,
                0.95
              )
            );

          box-shadow:
            0 15px 45px
            rgba(
              0,
              0,
              0,
              0.3
            );
        }


        .insights-header {

          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 15px;

          flex-wrap: wrap;

          margin-bottom: 20px;
        }


        .insights-header h2 {

          margin: 0;

          font-size: 24px;
        }


        .insights-header p {

          margin:
            7px
            0
            0;

          color: #9999b2;

          font-size: 13px;
        }


        .insight-summary {

          padding: 20px;

          margin-bottom: 15px;

          border-radius: 17px;

          background:
            rgba(
              139,
              92,
              246,
              0.10
            );

          border:
            1px solid
            rgba(
              139,
              92,
              246,
              0.25
            );
        }


        .insight-grid {

          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(
                220px,
                1fr
              )
            );

          gap: 15px;
        }


        .insight-box {

          padding: 18px;

          border-radius: 17px;

          background:
            rgba(
              15,
              20,
              50,
              0.7
            );

          border:
            1px solid
            rgba(
              99,
              102,
              241,
              0.3
            );
        }


        .insight-title {

          color: #c084fc;

          font-weight: 700;

          margin-bottom: 12px;

          font-size: 15px;
        }


        .insight-text {

          color: #d8d8e8;

          line-height: 1.7;
        }


        .theme-list {

          display: flex;

          flex-wrap: wrap;

          gap: 8px;
        }


        .theme-pill {

          padding:
            7px
            11px;

          border-radius: 20px;

          background:
            rgba(
              236,
              72,
              153,
              0.12
            );

          border:
            1px solid
            rgba(
              236,
              72,
              153,
              0.3
            );

          color: #f9a8d4;

          font-size: 12px;
        }


        .mood {

          font-size: 22px;

          font-weight: 700;

          color: #5eead4;

          margin-top: 15px;
        }


        .growth-list {

          margin: 0;

          padding-left: 20px;

          color: #d8d8e8;

          line-height: 1.8;
        }


        .insight-wide {

          margin-top: 15px;

          padding: 18px;

          border-radius: 17px;

          background:
            rgba(
              15,
              20,
              50,
              0.7
            );

          border:
            1px solid
            rgba(
              168,
              85,
              247,
              0.25
            );
        }


        .next-step {

          border-color:
            rgba(
              34,
              211,
              238,
              0.35
            );
        }


        .next-step .insight-title {

          color: #22d3ee;
        }


        .journal-count {

          text-align: right;

          color: #777793;

          font-size: 12px;

          margin-top: 15px;
        }


        /* ====================================================
           FEATURES
        ==================================================== */

        .features {

          margin-top: 20px;

          padding: 20px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              1fr
            );

          gap: 15px;

          border-radius: 20px;

          border:
            1px solid
            rgba(
              99,
              102,
              241,
              0.4
            );

          background:
            rgba(
              20,
              20,
              45,
              0.7
            );
        }


        .feature {

          padding: 10px;

          text-align: center;
        }


        .feature-icon {

          font-size: 29px;

          margin-bottom: 8px;
        }


        .feature-title {

          font-weight: 700;

          font-size: 14px;

          margin-bottom: 5px;
        }


        .feature-text {

          color: #85859f;

          font-size: 12px;

          line-height: 1.5;
        }


        .pink {
          color: #f472b6;
        }


        .yellow {
          color: #facc15;
        }


        .cyan {
          color: #22d3ee;
        }


        /* ====================================================
           LOGIN
        ==================================================== */

        .login-card {

          max-width: 600px;

          margin:
            35px
            auto;

          text-align: center;
        }


        .login-icon {

          font-size: 55px;

          margin-bottom: 10px;
        }


        .login-card h2 {

          margin: 0;

          font-size: 28px;
        }


        .login-card p {

          color: #9999b2;

          line-height: 1.7;

          margin:
            12px
            auto
            25px;

          max-width: 450px;
        }


        .google-btn {

          border: 0;

          padding:
            14px
            25px;

          border-radius: 13px;

          background: white;

          color: #18181b;

          font-weight: 700;

          font-size: 15px;

          cursor: pointer;

          transition:
            0.2s ease;
        }


        .google-btn:hover {

          transform:
            translateY(-2px);

          box-shadow:
            0 10px 25px
            rgba(
              255,
              255,
              255,
              0.15
            );
        }


        /* ====================================================
           ERROR
        ==================================================== */

        .error {

          margin-top: 15px;

          padding:
            12px
            15px;

          border-radius: 12px;

          background:
            rgba(
              239,
              68,
              68,
              0.1
            );

          border:
            1px solid
            rgba(
              239,
              68,
              68,
              0.3
            );

          color: #fca5a5;

          font-size: 14px;
        }


        /* ====================================================
           FOOTER
        ==================================================== */

        .footer {

          text-align: center;

          margin-top: 25px;

          color: #73738e;

          font-size: 12px;
        }


        .footer strong {

          color: #c084fc;
        }


        /* ====================================================
           MOBILE
        ==================================================== */

        @media (max-width: 650px) {

          .app {

            padding:
              25px
              12px;
          }


          .title {

            font-size: 30px;

            line-height: 1.2;

            letter-spacing: -1px;
          }


          .card {

            padding: 20px;

            border-radius: 19px;
          }


          textarea {

            min-height: 180px;

            font-size: 15px;
          }


          .bottom-row {

            flex-direction: column;

            align-items: stretch;
          }


          .tip {

            width: 100%;

            text-align: center;
          }


          .counter {

            margin-left: auto;
          }


          .talk-btn {

            width: 100%;
          }


          .features {

            grid-template-columns: 1fr;
          }


          .user-bar {

            max-width: 100%;

            font-size: 12px;
          }


          .response {

            padding: 17px;
          }


          .response-text {

            padding: 15px;

            font-size: 14px;
          }


          .insights {

            padding: 18px;
          }


          .insights-header h2 {

            font-size: 21px;
          }

        }

      `}</style>


      <div className="app">

        <div className="container">


          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="header">

            <div className="sparkle">
              ✦
            </div>

            <h1 className="title">
              Personal Gemini Journal
            </h1>

            <p className="subtitle">
              Your thoughts. Your space.
              Your AI companion. ✨
            </p>

            <div className="gradient-line">
            </div>


            {user && (

              <div className="user-bar">

                <span className="online-dot">
                </span>

                <span>

                  Welcome,{" "}

                  <strong>
                    {user.displayName}
                  </strong>

                </span>


                <button
                  className="logout"
                  onClick={getInsights}
                >
                  ✨ My Insights
                </button>


                <button
                  className="logout"
                  onClick={handleLogout}
                >
                  ↪ Logout
                </button>

              </div>
            )}

          </header>


          {/* ==================================================
              LOGIN
          ================================================== */}

          {!user ? (

            <div
              className="
                card
                login-card
              "
            >

              <div className="login-icon">
                🔐
              </div>

              <h2>
                Welcome to your private journal
              </h2>

              <p>
                Write your thoughts,
                ideas and plans.
                Gemini is here to help
                you think, reflect and explore.
              </p>

              <button
                className="google-btn"
                onClick={handleLogin}
              >
                Continue with Google
              </button>


              {error && (

                <div className="error">
                  {error}
                </div>

              )}

            </div>

          ) : (

            <>


              {/* ==============================================
                  JOURNAL CARD
              ============================================== */}

              <div className="card">

                <h2 className="section-title">

                  <span>
                    💬
                  </span>

                  What's on your mind?

                </h2>


                <p className="hint">

                  Write your thoughts,
                  ideas, plans or anything
                  you want to discuss... 💡

                </p>


                <textarea

                  value={message}

                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }

                  placeholder=
                    "✏️ Start writing your thoughts here..."

                  maxLength={2000}

                />


                <div className="bottom-row">

                  <div className="tip">

                    ✨ Tip:
                    Be open,
                    write anything!

                  </div>


                  <span className="counter">

                    {message.length}
                    {" / "}
                    2000

                  </span>


                  <button

                    className="talk-btn"

                    onClick={
                      sendJournal
                    }

                    disabled={
                      loading ||
                      !message.trim()
                    }

                  >

                    {loading

                      ? "✨ Gemini is thinking..."

                      : "🚀 Talk to Gemini"}

                  </button>

                </div>


                {error && (

                  <div className="error">
                    {error}
                  </div>

                )}


                {/* ==========================================
                    GEMINI RESPONSE
                ========================================== */}

                {response && (

                  <div className="response">

                    <div className="response-title">

                      <span className="ai-icon">
                        ✦
                      </span>

                      <span>
                        Gemini
                      </span>

                      <span className="ai-badge">
                        AI Response
                      </span>

                    </div>


                    <div className="response-text">

                      {response}

                    </div>

                  </div>

                )}


                {/* ==========================================
                    INSIGHTS
                ========================================== */}

                {showInsights && (

                  <div className="insights">


                    <div className="insights-header">

                      <div>

                        <h2>
                          ✨ Your Personal Insights
                        </h2>

                        <p>
                          Patterns and reflections
                          from your recent journal entries
                        </p>

                      </div>


                      <button

                        className="talk-btn"

                        onClick={getInsights}

                        disabled={
                          insightsLoading
                        }

                      >

                        {insightsLoading

                          ? "✨ Analyzing..."

                          : "🔄 Refresh Insights"}

                      </button>

                    </div>


                    {/* ======================================
                        LOADING
                    ====================================== */}

                    {insightsLoading && (

                      <div
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "35px",
                          color:
                            "#c084fc"
                        }}
                      >

                        ✨ Gemini is
                        analyzing your
                        journal...

                      </div>

                    )}


                    {/* ======================================
                        INSIGHTS CONTENT
                    ====================================== */}

                    {!insightsLoading &&
                      insights?.insights && (

                        <>


                          {/* SUMMARY */}

                          <div className="insight-summary">

                            <div className="insight-title">
                              🧠 Overall Reflection
                            </div>

                            <div className="insight-text">

                              {
                                insights
                                  .insights
                                  .summary
                              }

                            </div>

                          </div>


                          {/* GRID */}

                          <div className="insight-grid">


                            {/* THEMES */}

                            <div className="insight-box">

                              <div className="insight-title">
                                🔥 Top Themes
                              </div>

                              <div className="theme-list">

                                {insights
                                  .insights
                                  .topThemes
                                  ?.map(
                                    (
                                      theme,
                                      index
                                    ) => (

                                      <span
                                        key={index}
                                        className="theme-pill"
                                      >
                                        {theme}
                                      </span>

                                    )
                                  )}

                              </div>

                            </div>


                            {/* MOOD */}

                            <div className="insight-box">

                              <div className="insight-title">
                                😊 Current Mood
                              </div>

                              <div className="mood">

                                {
                                  insights
                                    .insights
                                    .mood
                                }

                              </div>

                            </div>


                            {/* GROWTH */}

                            <div className="insight-box">

                              <div className="insight-title">
                                📈 Growth Areas
                              </div>

                              <ul className="growth-list">

                                {insights
                                  .insights
                                  .growthAreas
                                  ?.map(
                                    (
                                      area,
                                      index
                                    ) => (

                                      <li
                                        key={index}
                                      >
                                        {area}
                                      </li>

                                    )
                                  )}

                              </ul>

                            </div>

                          </div>


                          {/* RECURRING THOUGHTS */}

                          <div className="insight-wide">

                            <div className="insight-title">
                              🔁 Recurring Thoughts
                            </div>

                            <div className="insight-text">

                              {
                                insights
                                  .insights
                                  .recurringThoughts
                              }

                            </div>

                          </div>


                          {/* REFLECTION */}

                          <div className="insight-wide">

                            <div className="insight-title">
                              💡 Gemini's Reflection
                            </div>

                            <div className="insight-text">

                              {
                                insights
                                  .insights
                                  .reflection
                              }

                            </div>

                          </div>


                          {/* NEXT STEP */}

                          <div
                            className="
                              insight-wide
                              next-step
                            "
                          >

                            <div className="insight-title">

                              🎯 Your Next Step

                            </div>

                            <div className="insight-text">

                              {
                                insights
                                  .insights
                                  .nextStep
                              }

                            </div>

                          </div>


                          {/* JOURNAL COUNT */}

                          <div className="journal-count">

                            Based on{" "}

                            {
                              insights
                                .journalCount
                            }

                            {" "}
                            recent journal entries

                          </div>


                        </>

                      )}


                    {/* ======================================
                        NO JOURNALS
                    ====================================== */}

                    {!insightsLoading &&
                      insights?.message && (

                        <div
                          style={{
                            padding:
                              "25px",
                            textAlign:
                              "center",
                            color:
                              "#aaaac0"
                          }}
                        >

                          📝{" "}

                          {
                            insights.message
                          }

                        </div>

                      )}

                  </div>

                )}

              </div>


              {/* ==================================================
                  FEATURES
              ================================================== */}

              <div className="features">


                <div className="feature">

                  <div className="feature-icon">
                    🛡️
                  </div>

                  <div
                    className="
                      feature-title
                      pink
                    "
                  >
                    Private & Secure
                  </div>

                  <div className="feature-text">
                    Your thoughts stay
                    connected to your account.
                  </div>

                </div>


                <div className="feature">

                  <div className="feature-icon">
                    ⚡
                  </div>

                  <div
                    className="
                      feature-title
                      yellow
                    "
                  >
                    AI Powered
                  </div>

                  <div className="feature-text">
                    Powered by Google Gemini.
                  </div>

                </div>


                <div className="feature">

                  <div className="feature-icon">
                    ✨
                  </div>

                  <div
                    className="
                      feature-title
                      cyan
                    "
                  >
                    Personal Insights
                  </div>

                  <div className="feature-text">
                    Discover patterns,
                    themes and growth areas
                    from your journal.
                  </div>

                </div>

              </div>

            </>

          )}


          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="footer">

            ✨{" "}

            <strong>
              Personal Gemini Journal
            </strong>

            {" • "}

            Made with ❤️ and Gemini ✨

          </div>

        </div>

      </div>

    </>
  );
}


export default App;