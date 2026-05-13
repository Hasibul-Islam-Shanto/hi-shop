import { MapPin, Truck } from "lucide-react"

const INPUT_CLASS =
  "w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ghost-border transition-shadow"

const FIELDS = [
  { label: "First Name", placeholder: "Julian", span: 1, type: "text" },
  { label: "Last Name", placeholder: "Anders", span: 1, type: "text" },
  { label: "Email Address", placeholder: "julian@example.com", span: 2, type: "email" },
  { label: "Phone Number", placeholder: "+1 (555) 000-0000", span: 2, type: "tel" },
  { label: "Street Address", placeholder: "242 Kinetic Avenue, Suite 400", span: 2, type: "text" },
]

const DELIVERY_OPTIONS = [
  {
    label: "Standard Delivery",
    desc: "5–7 business days",
    price: "FREE",
    priceClass: "text-tertiary",
    selected: true,
  },
  {
    label: "Express Delivery",
    desc: "2–3 business days",
    price: "$12.00",
    priceClass: "text-on-surface",
    selected: false,
  },
  {
    label: "Next Day",
    desc: "1 business day",
    price: "$25.00",
    priceClass: "text-on-surface",
    selected: false,
  },
]

const CheckoutShippingForm = () => {
  return (
    <div className="bg-card rounded-2xl p-6 ghost-border shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
          1
        </div>
        <div>
          <h2 className="text-lg font-bold text-on-surface leading-tight">Shipping Details</h2>
          <p className="text-xs text-on-surface-variant">Where should we deliver your order?</p>
        </div>
        <div className="ml-auto h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {FIELDS.map((field) => (
          <div key={field.label} className={field.span === 2 ? "col-span-2" : ""}>
            <label className="label-text text-[10px] mb-1.5 block">{field.label}</label>
            <input type={field.type} placeholder={field.placeholder} className={INPUT_CLASS} />
          </div>
        ))}

        <div>
          <label className="label-text text-[10px] mb-1.5 block">City</label>
          <input type="text" placeholder="New York" className={INPUT_CLASS} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-text text-[10px] mb-1.5 block">State</label>
            <input type="text" placeholder="NY" className={INPUT_CLASS} />
          </div>
          <div>
            <label className="label-text text-[10px] mb-1.5 block">ZIP Code</label>
            <input type="text" placeholder="10001" className={INPUT_CLASS} />
          </div>
        </div>

        <div className="col-span-2">
          <label className="label-text text-[10px] mb-1.5 block">Country</label>
          <select className={INPUT_CLASS}>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
            <option>Australia</option>
          </select>
        </div>
      </div>

      <div className="h-px bg-border/40 mb-5" />

      <div className="flex items-center gap-3 mb-4">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Truck className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="label-text text-[10px]">Delivery Method</h3>
      </div>

      <div className="space-y-2">
        {DELIVERY_OPTIONS.map((opt) => (
          <div
            key={opt.label}
            className={`flex items-center justify-between px-4 py-3 rounded-xl ghost-border cursor-pointer transition-all duration-200 ${
              opt.selected
                ? "bg-primary/8 ring-1 ring-primary/30"
                : "bg-surface-container-low hover:bg-surface-container"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  opt.selected ? "border-primary" : "border-outline-variant"
                }`}
              >
                {opt.selected && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{opt.label}</p>
                <p className="text-[11px] text-on-surface-variant">{opt.desc}</p>
              </div>
            </div>
            <span className={`text-sm font-bold shrink-0 ${opt.priceClass}`}>{opt.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CheckoutShippingForm
