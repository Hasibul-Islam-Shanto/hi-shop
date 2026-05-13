"use client"

import { useState } from "react"

import CheckoutOrderSummary from "./checkout-order-summary"
import CheckoutShippingSelector from "./checkout-shipping-selector"
import CheckoutStepper from "./checkout-stepper"

interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface CheckoutViewProps {
  initialAddresses: Address[]
}

const CheckoutView = ({ initialAddresses }: CheckoutViewProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [shippingAddressId, setShippingAddressId] = useState<string | null>(
    () => initialAddresses.find((a) => a.isDefault)?.id ?? null,
  )
  const [discountCode, setDiscountCode] = useState("")

  return (
    <>
      <CheckoutStepper currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {currentStep === 0 && (
            <CheckoutShippingSelector
              initialAddresses={initialAddresses}
              selectedId={shippingAddressId}
              onSelect={setShippingAddressId}
              onContinue={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 1 && (
            <div className="bg-card rounded-2xl p-6 ghost-border shadow-(--shadow-sm)">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface leading-tight">Review Order</h2>
                  <p className="text-xs text-on-surface-variant">
                    Confirm your items before placing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="text-xs text-primary font-semibold hover:underline underline-offset-4"
              >
                ← Change shipping address
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <CheckoutOrderSummary
            shippingAddressId={shippingAddressId}
            currentStep={currentStep}
            discountCode={discountCode}
            onDiscountChange={setDiscountCode}
          />
        </div>
      </div>
    </>
  )
}

export default CheckoutView
