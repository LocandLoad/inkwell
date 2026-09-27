import { EventBus } from "../event-bus.js";
let count = 0;

EventBus.on("post.published", (payload) => {
    count++;
});

export const StatListener = {
    getStats()
    {
        return {
            count
        };
    }
}