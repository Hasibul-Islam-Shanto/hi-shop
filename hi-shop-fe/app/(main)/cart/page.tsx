import CartView from "./_components/cart-view"

export default function CartPage() {
  return (
    <div className="pt-8 pb-16">
      <div className="container">
        <span className="label-text text-primary mb-1 block">Shopping</span>
        <h1 className="text-3xl font-extrabold text-on-surface mb-1">Your Cart</h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Review your selected items before checkout.
        </p>

        <CartView />
      </div>
    </div>
  )
}
