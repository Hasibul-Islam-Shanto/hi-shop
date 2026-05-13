import { Check } from "lucide-react"

const STEPS = ["Shipping", "Payment", "Confirmation"]

interface CheckoutStepperProps {
  currentStep: number
}

const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  return (
    <nav className="flex items-center gap-2 mb-10">
      {STEPS.map((step, i) => (
        <span key={step} className="flex items-center gap-2">
          <span
            className={`flex items-center gap-2 text-sm transition-colors ${
              i <= currentStep ? "text-primary font-semibold" : "text-on-surface-variant"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-all duration-300 ${
                i < currentStep
                  ? "bg-tertiary text-tertiary-foreground"
                  : i === currentStep
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{step}</span>
          </span>

          {i < STEPS.length - 1 && (
            <span
              className={`h-px w-8 sm:w-16 transition-colors duration-300 ${
                i < currentStep ? "bg-tertiary" : "bg-outline-variant"
              }`}
            />
          )}
        </span>
      ))}
    </nav>
  )
}

export default CheckoutStepper
