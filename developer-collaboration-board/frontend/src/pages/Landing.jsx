import { Link } from "react-router-dom";

function Landing() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Developer Collaboration Board</p>
          <h1>Plan work, assign tasks, and track progress with your team.</h1>
          <p>
            A full-stack collaboration app with authentication, admin/member
            roles, protected task routes, real user assignment, and MongoDB task
            persistence.
          </p>

          <div className="landing-actions">
            <Link className="primary-link" to="/login">
              Login
            </Link>
            <Link className="secondary-link" to="/signup">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="landing-panel">
          <div className="mini-board-header">
            <span>Team Sprint</span>
            <strong>4 tasks</strong>
          </div>
          <div className="mini-task">
            <span className="mini-dot todo-dot" />
            <div>
              <strong>Build dashboard UI</strong>
              <p>Assigned to Avinash</p>
            </div>
          </div>
          <div className="mini-task">
            <span className="mini-dot progress-dot" />
            <div>
              <strong>Connect task API</strong>
              <p>In Progress</p>
            </div>
          </div>
          <div className="mini-task">
            <span className="mini-dot done-dot" />
            <div>
              <strong>Protect routes</strong>
              <p>Done</p>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <article>
          <strong>JWT Auth</strong>
          <p>Users sign up, log in, and access protected board routes.</p>
        </article>
        <article>
          <strong>Role Control</strong>
          <p>Admins create tasks while members work on assigned tasks.</p>
        </article>
        <article>
          <strong>Real Assignment</strong>
          <p>Tasks are assigned to registered users, not plain text names.</p>
        </article>
      </section>
    </main>
  );
}

export default Landing;
