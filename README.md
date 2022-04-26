## Notes

- Assumptions: running on internal network. No public access by browsers so
  typical CORS and other protections are not required

- How many tokens should we allow to be queried at once?

  - 100 seems like a decent number to allow most reasonable requests to succeed
    while mitigating DOS

- What's the largest sized secret we should allow?

  - [Fastify](https://www.fastify.io/docs/latest/Reference/Server/#bodylimit)
    defaults to a 1mb body limit.
    - If we allow 100 tokens to be queried at once, leads to a max 100mb
      response

- A Bearer token is required to restrict which services have access.
  - Provides protection if services which do not need access to this api are
    compromised.
  - Provides protection if the database is compromised
  - Each service which requires access should use a unique bearer token to for
    rate tracking and to allow the services to be quickly removed from the
    allow-list in the case it is compromised
