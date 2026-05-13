"use client"

import { useState } from "react"

import { CreditCard, Lock, Smartphone, Wallet } from "lucide-react"

const INPUT_CLASS =
  "w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border transition-shadow"

const PAYMENT_METHODS = [
  { name: "Credit Card", icon: CreditCard },
  { name: "Digital Wallet", icon: Wallet },
  { name: "Mobile Pay", icon: Smartphone },
]

const CheckoutPaymentForm = () => {
  const [selectedPayment, setSelectedPayment] = useState(0)

  return (
    <div className="bg-card rounded-2xl p-6 ghost-border shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
          2
        </div>
        <div>
          <h2 className="text-lg font-bold text-on-surface leading-tight">Payment Method</h2>
          <p className="text-xs text-on-surface-variant">Your payment info is always encrypted</p>
        </div>
        <div className="ml-auto h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Lock className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {PAYMENT_METHODS.map((method, i) => (
          <button
            key={method.name}
            onClick={() => setSelectedPayment(i)}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all duration-200 ${
              selectedPayment === i
                ? "bg-primary/10 ring-2 ring-primary shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                : "bg-surface-container-low ghost-border hover:bg-surface-container"
            }`}
          >
            <method.icon
              className={`h-5 w-5 transition-colors ${
                selectedPayment === i ? "text-primary" : "text-on-surface-variant"
              }`}
            />
            <span
              className={`text-xs font-medium transition-colors ${
                selectedPayment === i ? "text-primary" : "text-on-surface"
              }`}
            >
              {method.name}
            </span>
          </button>
        ))}
      </div>

      {selectedPayment === 0 && (
        <div className="space-y-3">
          <div>
            <label className="label-text text-[10px] mb-1.5 block">Card Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="0000  0000  0000  0000"
                className={`${INPUT_CLASS} pr-10`}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            </div>
          </div>

          <div>
            <label className="label-text text-[10px] mb-1.5 block">Cardholder Name</label>
            <input type="text" placeholder="Julian Anders" className={INPUT_CLASS} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text text-[10px] mb-1.5 block">Expiry Date</label>
              <input type="text" placeholder="MM / YY" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="label-text text-[10px] mb-1.5 block">CVV</label>
              <input type="text" placeholder="•••" className={INPUT_CLASS} />
            </div>
          </div>
        </div>
      )}

      {selectedPayment === 1 && (
        <div className="flex flex-col items-center py-8 gap-3 bg-surface-container-low rounded-xl ghost-border">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-bold text-on-surface">Connect Your Wallet</p>
          <p className="text-xs text-on-surface-variant text-center max-w-xs px-4">
            You will be redirected to complete your payment securely through your digital wallet.
          </p>
        </div>
      )}

      {selectedPayment === 2 && (
        <div className="flex flex-col items-center py-8 gap-3 bg-surface-container-low rounded-xl ghost-border">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-bold text-on-surface">Mobile Pay</p>
          <p className="text-xs text-on-surface-variant text-center max-w-xs px-4">
            Use Face ID, fingerprint, or your device PIN to authenticate and complete the payment.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 p-3 bg-surface-container-low rounded-xl ghost-border">
        <Lock className="h-3.5 w-3.5 text-tertiary shrink-0" />
        <p className="text-[11px] text-on-surface-variant">
          256-bit SSL encrypted · Your card data is never stored on our servers
        </p>
      </div>
    </div>
  )
}

export default CheckoutPaymentForm
