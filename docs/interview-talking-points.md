# Interview Talking Points

- The project is about proving correctness after failure, not just processing orders.
- The hard part is replay safety under duplicate and out-of-order events.
- The main technical contribution is the ledger-to-shadow-to-divergence-to-repair loop.
