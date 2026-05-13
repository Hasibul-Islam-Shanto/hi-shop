import { LoginForm } from "../components/login-form";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-tertiary/3 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden ghost-border shadow-(--shadow-xl) bg-card">
        <div className="relative hidden lg:flex flex-col justify-between min-h-[600px] overflow-hidden bg-surface-container-low p-10">
          <div
            className="absolute inset-0"
            style={{ background: "var(--gradient-aurora-subtle)" }}
            aria-hidden="true"
          />

          <div
            className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20"
            style={{ background: "var(--gradient-aurora)" }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-20 -left-16 h-48 w-48 rounded-full opacity-10"
            style={{ background: "var(--gradient-aurora)" }}
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />

          <div className="relative flex items-center gap-2.5">
            <img src="/hi_shop_logo.svg" alt="hi-shop" className="h-10 w-10" />
            <div>
              <p className="text-sm font-extrabold text-on-surface tracking-tight">
                hi&#8209;shop
              </p>
              <p className="text-[10px] text-on-surface-variant">
                Admin Dashboard
              </p>
            </div>
          </div>

          <div className="relative space-y-2.5">
            {[
              {
                label: "Real-time analytics",
                sub: "Track revenue, orders & inventory",
              },
              {
                label: "Full inventory control",
                sub: "Add, edit & manage products",
              },
              {
                label: "Order management",
                sub: "Update status, filter & search",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 bg-surface-container/50 backdrop-blur-sm rounded-xl px-4 py-3 ghost-border"
              >
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {item.label}
                  </p>
                  <p className="text-xs text-on-surface-variant">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <h2 className="text-3xl font-extrabold text-on-surface mb-2 leading-tight tracking-tight">
              Welcome back
              <br />
              to your store.
            </h2>
            <p className="text-sm text-on-surface-variant mb-5">
              Everything you need to run hi&#8209;shop, in one place.
            </p>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["EV", "MK", "JP", "SR"].map((initials, i) => (
                  <div
                    key={initials}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground ring-2 ring-card"
                    style={{
                      background: `hsl(${235 + i * 25} 70% 65%)`,
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant">
                <span className="font-semibold text-on-surface">10k+</span>{" "}
                merchants trust hi&#8209;shop.
              </p>
            </div>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
