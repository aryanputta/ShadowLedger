import http from "k6/http";
export default function () {
  http.post("http://localhost:3000/orders", JSON.stringify({
    customer_id: "cust",
    total_amount: 10,
    sku: "sku-1",
    quantity: 1,
    idempotency_key: `k-${__ITER}`,
    region: "us-east-1"
  }), { headers: { "Content-Type": "application/json" } });
}
