---
title: 'Model Context Protocol: v2 Stateless Architecture Explained'
date: '2026-07-04'
excerpt: >-
  Learn what's changing in the upcoming Model Context Protocol 2026-07-28
  specification, including its stateless architecture, SDK updates, and
  migration steps.
tags: [MCP, AI protocols, stateless architecture]
keyTakeaways: 
  - The Model Context Protocol (MCP) is moving to a stateless architecture in the 2026-07-28 specification
  - Protocol-level sessions are being removed, simplifying deployments and scaling
  - Every request will carry its own context, making servers easier to scale and maintain
  - New HTTP headers (`Mcp-Method` and `Mcp-Name`) are required for routing requests
  - Explicit state handles (like `job_id`, `basket_id`, `conversation_id`) replace sessions for multi-request workflows
---

The **Model Context Protocol (MCP)** has quickly become the standard way to connect AI models with external tools, databases, APIs, and services.

Since its launch, developers have built thousands of MCP servers that help AI applications interact with external systems in a standard way.

On **May 21, 2026**, the MCP community published the **2026-07-28 Release Candidate**, introducing the biggest architectural change since the protocol was first released. If adopted as planned, the **2026-07-28 specification**, scheduled for **July 28, 2026**, will move MCP to a **stateless architecture**.

This is a major change for developers. It removes protocol-level sessions, simplifies deployments, and makes MCP servers much easier to scale in production. Let's look at what is changing and how you can prepare for it.

## Why Is MCP Moving to a Stateless Architecture?

![MCP Moving to a Stateless Architecture](/assets/img/blog-data/mcp-arch-update.png)

Earlier MCP specifications relied on protocol-level sessions. After connecting, a client established a session that the server maintained across multiple requests. While this worked well for many use cases, it also introduced several infrastructure challenges:

* Servers had to maintain session state.
* Load balancers often required sticky sessions.
* Horizontal scaling became more difficult.
* Recovering from server failures was more complex.

The upcoming **2026-07-28 specification** removes protocol-managed sessions entirely. Instead, every request becomes self-contained. Any server instance can process any request without relying on previous interactions. This aligns MCP with modern cloud-native architecture, where stateless services are easier to deploy, scale, and maintain.

## What Is Changing?

### The Initialize Handshake Is Being Removed

Previous MCP versions required clients to perform an `initialize` request followed by an `initialized` notification before making tool calls. The upcoming specification removes this handshake. Instead, now clients discover server capabilities using:

```text
server/discover
```

This reduces connection overhead and simplifies the protocol.

### Every Request Carries Its Own Context

One of the biggest changes is that requests become completely self-contained. Each request includes a `_meta` object containing information such as:

* Protocol version
* Client capabilities
* Client information

Since every request contains the required context, servers no longer need to remember information from previous requests.

### New HTTP Headers

For Streamable HTTP transports, two request headers become mandatory:

* `Mcp-Method`
* `Mcp-Name`

These headers allow proxies and servers to route requests without inspecting the request body. This improves routing performance while keeping the protocol simple.

### Explicit State Handles Replace Sessions

Some workflows naturally span multiple requests. Instead of storing state inside the protocol session, servers now return identifiers that clients pass back when needed.

For example:

* `job_id`
* `basket_id`
* `conversation_id`

The server simply processes the identifier provided in the request. No protocol-level session is required.

## Why This Change Matters

Moving to a stateless architecture offers several practical benefits.

1. **Easier Horizontal Scaling** : Since every request is independent, any server instance can process it, there is no need for sticky sessions or shared session storage.
2. **Better Reliability**: If one server instance becomes unavailable, another instance can immediately continue serving requests. This improves resilience and reduces downtime.
3. **Simpler Cloud Deployments** : Stateless services work naturally with Kubernetes, serverless platforms, and modern load balancers. This makes production deployments simpler and easier to manage.

![Horizontal Scaling](/assets/img/blog-data/horizontal-scaling.png)

## Deprecation Policy

The upcoming specification also introduces an official **12-month deprecation policy**. The following protocol features are marked for deprecation:

* Roots
* Sampling
* Logging

Assuming the **2026-07-28 specification** is finalized as planned, these features will remain supported for approximately **12 months after the final release**, giving developers time to migrate.

Over time, these capabilities are expected to move toward:

* Direct LLM provider APIs
* OpenTelemetry for logging and observability

## Migration Checklist

If you're preparing for the upcoming specification, here are the key changes to plan for:

| Change                                      | Action      |
| ------------------------------------------- | ----------- |
| Remove `initialize` handshake               | Required    |
| Implement `server/discover`                 | Required    |
| Include `_meta` in every request            | Required    |
| Add `Mcp-Method` header                     | Required    |
| Add `Mcp-Name` header                       | Required    |
| Replace protocol sessions with explicit IDs | Required    |
| Upgrade to the latest SDKs                  | Recommended |


## Final Thoughts

The upcoming **2026-07-28 Model Context Protocol specification** represents one of the biggest architectural changes since MCP was introduced. By removing protocol-level sessions, the protocol becomes easier to scale, simpler to deploy, and better suited for modern cloud-native infrastructure.

Although these changes introduce breaking updates, they also remove many of the operational challenges that developers faced when deploying MCP servers in production. If you're building or maintaining an MCP server, now is a good time to start testing the release candidate and preparing your applications for the upcoming specification. Early testing will make the transition smoother once the final specification is published.
