import { ref, onMounted } from 'vue';
import EventCard from '../components/EventCard.vue';
import { fetchEvents } from '../api/events';
const events = ref([]);
const loading = ref(true);
const error = ref(null);
onMounted(async () => {
    try {
        events.value = await fetchEvents();
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    }
    finally {
        loading.value = false;
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['event-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "event-list" },
});
/** @type {__VLS_StyleScopedClasses['event-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "event-list__error" },
    });
    /** @type {__VLS_StyleScopedClasses['event-list__error']} */ ;
    (__VLS_ctx.error);
}
else if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "event-list__state" },
    });
    /** @type {__VLS_StyleScopedClasses['event-list__state']} */ ;
}
else if (__VLS_ctx.events.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "event-list__state" },
    });
    /** @type {__VLS_StyleScopedClasses['event-list__state']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "event-list__grid" },
    });
    /** @type {__VLS_StyleScopedClasses['event-list__grid']} */ ;
    for (const [event] of __VLS_vFor((__VLS_ctx.events))) {
        const __VLS_0 = EventCard;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
            key: (event.id),
            event: (event),
        }));
        const __VLS_2 = __VLS_1({
            key: (event.id),
            event: (event),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        // @ts-ignore
        [error, error, loading, events, events,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
