import { computed } from 'vue';
const props = defineProps();
const formattedDate = computed(() => {
    if (!props.event.startDate)
        return 'Date TBA';
    return new Date(props.event.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['event-card']} */ ;
/** @type {__VLS_StyleScopedClasses['event-card__image']} */ ;
/** @type {__VLS_StyleScopedClasses['event-card__body']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: ({ name: 'EventDetail', params: { slug: __VLS_ctx.event.slug } }),
    ...{ class: "event-card" },
}));
const __VLS_2 = __VLS_1({
    to: ({ name: 'EventDetail', params: { slug: __VLS_ctx.event.slug } }),
    ...{ class: "event-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5;
/** @type {__VLS_StyleScopedClasses['event-card']} */ ;
const { default: __VLS_6 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "event-card__image" },
});
/** @type {__VLS_StyleScopedClasses['event-card__image']} */ ;
if (__VLS_ctx.event.heroImage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.event.heroImage),
        alt: (__VLS_ctx.event.name),
    });
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "event-card__image-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['event-card__image-placeholder']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "event-card__body" },
});
/** @type {__VLS_StyleScopedClasses['event-card__body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
(__VLS_ctx.event.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "event-card__date" },
});
/** @type {__VLS_StyleScopedClasses['event-card__date']} */ ;
(__VLS_ctx.formattedDate);
if (__VLS_ctx.event.venue) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "event-card__venue" },
    });
    /** @type {__VLS_StyleScopedClasses['event-card__venue']} */ ;
    (__VLS_ctx.event.venue);
}
// @ts-ignore
[event, event, event, event, event, event, event, formattedDate,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
