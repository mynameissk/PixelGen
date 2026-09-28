# PixelGen build plan

Every phase is integrated into the same application. A phase is complete only when it runs, passes its checks, and its implemented scope is documented.

1. **Playable world foundation (current):** browser shell, pixel-art plaza, keyboard/click movement, collision, demo residents, local chat and emotes.
2. **Real-time vertical slice:** account/session foundation, authenticated WebSocket rooms, server-validated movement, persisted profile, two browsers seeing each other.
3. **Social and safety:** friends, private messages, block/mute/report, chat rate limits and moderation queue.
4. **Avatar and inventory:** modular avatar data, catalog, server-owned inventory and safe equip/unequip actions.
5. **Progression and homes:** quests, XP, achievements, personal home, furniture placement and visits.
6. **Content tools:** map schema/editor, NPC and portal configuration, item/quest/event management.
7. **Operations and release:** admin roles and audit log, backups and restore drill, load/security tests, closed alpha then beta.

Payments, premium currency, and multi-server scaling are deliberately deferred until the core game loop and economy are validated.
