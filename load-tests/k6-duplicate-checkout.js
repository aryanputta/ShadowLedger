import http from "k6/http";
export default function () {
  const body = JSON.stringify({
    customer_id: "cust",
    total_amount: 10,
    sku: "sku-1",
    quantity: 1,
    idempotency_key: "duplicate-key",
    region: "us-east-1"
  });
  http.post("http://localhost:3000/orders", body, { headers: { "Content-Type": "application/json" } });
}
