# Morrow: teammate brief

Morrow lets a merchant sell AI agents a paid, time-boxed commitment on scarce inventory.

The demo uses the last Friday dinner slot because the problem is instantly visible. Two buyer agents accept the same 0.20 XSGD x402 terms. The merchant decides who gets the inventory, only the winner is eligible to settle, and the loser pays S$0. The winner receives a machine-readable commitment receipt and exercises it into a booking; the 0.20 XSGD is credited in full.

This is not only for restaurants. The same merchant contract works for clinic appointments, event tickets, rental windows, hotel inventory, and any limited stock an agent might otherwise reserve speculatively.

## Why Track 3

The merchant, not the shopping agent, is the product owner. Morrow gives merchants a new API, pricing policy, inventory decision, and receipt format designed for AI customers. x402 is the purchase interface rather than a checkout decoration.

## Hackathon resources

- **StraitsX:** the commitment is SGD-denominated in XSGD.
- **Avalanche:** payment terms target XSGD on C-Chain mainnet (`eip155:43114`).
- **x402:** the merchant endpoint responds with exact payment requirements for 0.20 XSGD.
- **AWS:** a production version would use conditional inventory writes, queues, signing, and monitoring. The public MVP does not falsely claim an AWS deployment.

## What exists now

The Vercel MVP exposes the merchant capability and x402 terms and includes a sample checkout for the inventory race. It does not accept or broadcast payment authorizations. The payment path is rehearsed separately against an Anvil fork of Avalanche mainnet; no verified mainnet settlement hash is configured in the deployment.
