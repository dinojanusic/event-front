import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { fetchEventBySlug } from '../api/events';
import { createReservation, releaseReservation } from '../api/reservations';
import { useReservationStore } from '../stores/reservation';
const route = useRoute();
const router = useRouter();
const reservationStore = useReservationStore();
const event = ref(null);
const loading = ref(true);
const error = ref(null);
const quantities = ref({});
const reserving = ref(false);
const reserveError = ref(null);
onMounted(async () => {
    try {
        event.value = await fetchEventBySlug(route.params.slug);
        for (const tier of event.value.ticketTiers ?? []) {
            quantities.value[tier.id] = 0;
        }
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    }
    finally {
        loading.value = false;
    }
});
const formattedDates = computed(() => {
    if (!event.value?.startDate)
        return 'Date TBA';
    const fmt = (d) => new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const start = fmt(event.value.startDate);
    if (!event.value.endDate || event.value.endDate === event.value.startDate)
        return start;
    return `${start} – ${fmt(event.value.endDate)}`;
});
function formatPrice(price, currency) {
    if (price == null)
        return 'Free';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency ?? 'USD',
    }).format(price);
}
function formatDate(dt) {
    return new Date(dt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
function maxQty(tier) {
    // Cap at live available count first, then static quota, then hard UI max of 10.
    const cap = tier.available ?? tier.quota ?? Infinity;
    return Math.min(cap, 10);
}
function increment(tier) {
    if (quantities.value[tier.id] < maxQty(tier))
        quantities.value[tier.id]++;
}
function decrement(tier) {
    if (quantities.value[tier.id] > 0)
        quantities.value[tier.id]--;
}
const totalSelected = computed(() => Object.values(quantities.value).reduce((sum, q) => sum + q, 0));
async function reserve() {
    const selectedTiers = (event.value?.ticketTiers ?? []).filter(t => quantities.value[t.id] > 0);
    if (!selectedTiers.length)
        return;
    reserving.value = true;
    reserveError.value = null;
    const createdUuids = [];
    try {
        const items = [];
        for (const tier of selectedTiers) {
            const qty = quantities.value[tier.id];
            const result = await createReservation(tier.id, qty);
            createdUuids.push(result.uuid);
            items.push({
                uuid: result.uuid,
                expiresAt: result.expiresAt,
                tierId: tier.id,
                tierName: tier.name,
                quantity: qty,
                price: tier.price ?? 0,
                currency: tier.currency,
            });
        }
        reservationStore.set(items);
        router.push('/checkout');
    }
    catch (e) {
        // Roll back any holds that were successfully created before the failure
        await Promise.allSettled(createdUuids.map(releaseReservation));
        reserveError.value = e instanceof Error ? e.message : String(e);
    }
    finally {
        reserving.value = false;
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['event-detail__hero']} */ ;
/** @type {__VLS_StyleScopedClasses['tier__qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tier__qty-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['reserve-bar__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['reserve-bar__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['event-detail__content']} */ ;
/** @type {__VLS_StyleScopedClasses['event-detail__hero']} */ ;
/** @type {__VLS_StyleScopedClasses['tier']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "event-detail" },
});
/** @type {__VLS_StyleScopedClasses['event-detail']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "event-detail__state" },
    });
    /** @type {__VLS_StyleScopedClasses['event-detail__state']} */ ;
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "event-detail__error" },
    });
    /** @type {__VLS_StyleScopedClasses['event-detail__error']} */ ;
    (__VLS_ctx.error);
}
else if (__VLS_ctx.event) {
    if (__VLS_ctx.event.heroImage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "event-detail__hero" },
        });
        /** @type {__VLS_StyleScopedClasses['event-detail__hero']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.event.heroImage),
            alt: (__VLS_ctx.event.name),
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "event-detail__content" },
    });
    /** @type {__VLS_StyleScopedClasses['event-detail__content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "event-detail__header" },
    });
    /** @type {__VLS_StyleScopedClasses['event-detail__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    (__VLS_ctx.event.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "event-detail__meta" },
    });
    /** @type {__VLS_StyleScopedClasses['event-detail__meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "event-detail__date" },
    });
    /** @type {__VLS_StyleScopedClasses['event-detail__date']} */ ;
    (__VLS_ctx.formattedDates);
    if (__VLS_ctx.event.venue) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "event-detail__venue" },
        });
        /** @type {__VLS_StyleScopedClasses['event-detail__venue']} */ ;
        (__VLS_ctx.event.venue);
    }
    if (__VLS_ctx.event.description) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "event-detail__description" },
        });
        /** @type {__VLS_StyleScopedClasses['event-detail__description']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({});
        __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.event.description) }, null, null);
    }
    if (__VLS_ctx.event.ticketTiers?.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "event-detail__tickets" },
        });
        /** @type {__VLS_StyleScopedClasses['event-detail__tickets']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        if (__VLS_ctx.reservationStore.isActive) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "reserve-notice" },
            });
            /** @type {__VLS_StyleScopedClasses['reserve-notice']} */ ;
            let __VLS_0;
            /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
            RouterLink;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                to: "/checkout",
                ...{ class: "reserve-notice__link" },
            }));
            const __VLS_2 = __VLS_1({
                to: "/checkout",
                ...{ class: "reserve-notice__link" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            /** @type {__VLS_StyleScopedClasses['reserve-notice__link']} */ ;
            const { default: __VLS_5 } = __VLS_3.slots;
            // @ts-ignore
            [loading, error, error, event, event, event, event, event, event, event, event, event, event, formattedDates, reservationStore,];
            var __VLS_3;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "tier-list" },
        });
        /** @type {__VLS_StyleScopedClasses['tier-list']} */ ;
        for (const [tier] of __VLS_vFor((__VLS_ctx.event.ticketTiers))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (tier.id),
                ...{ class: "tier" },
                ...{ class: ({ 'tier--soldout': tier.available === 0 }) },
            });
            /** @type {__VLS_StyleScopedClasses['tier']} */ ;
            /** @type {__VLS_StyleScopedClasses['tier--soldout']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "tier__info" },
            });
            /** @type {__VLS_StyleScopedClasses['tier__info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "tier__name" },
            });
            /** @type {__VLS_StyleScopedClasses['tier__name']} */ ;
            (tier.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "tier__price" },
            });
            /** @type {__VLS_StyleScopedClasses['tier__price']} */ ;
            (__VLS_ctx.formatPrice(tier.price, tier.currency));
            if (tier.salesEnd) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "tier__window" },
                });
                /** @type {__VLS_StyleScopedClasses['tier__window']} */ ;
                (__VLS_ctx.formatDate(tier.salesEnd));
            }
            if (tier.available === 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "tier__availability tier__availability--soldout" },
                });
                /** @type {__VLS_StyleScopedClasses['tier__availability']} */ ;
                /** @type {__VLS_StyleScopedClasses['tier__availability--soldout']} */ ;
            }
            else if (tier.available != null && tier.available <= 10) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "tier__availability tier__availability--low" },
                });
                /** @type {__VLS_StyleScopedClasses['tier__availability']} */ ;
                /** @type {__VLS_StyleScopedClasses['tier__availability--low']} */ ;
                (tier.available);
            }
            else if (tier.available != null) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "tier__availability" },
                });
                /** @type {__VLS_StyleScopedClasses['tier__availability']} */ ;
                (tier.available);
            }
            if (tier.available !== 0) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "tier__qty" },
                });
                /** @type {__VLS_StyleScopedClasses['tier__qty']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!!(__VLS_ctx.error))
                                return;
                            if (!(__VLS_ctx.event))
                                return;
                            if (!(__VLS_ctx.event.ticketTiers?.length))
                                return;
                            if (!(tier.available !== 0))
                                return;
                            __VLS_ctx.decrement(tier);
                            // @ts-ignore
                            [event, formatPrice, formatDate, decrement,];
                        } },
                    ...{ class: "tier__qty-btn" },
                    'aria-label': "Decrease quantity",
                    disabled: (__VLS_ctx.quantities[tier.id] <= 0 || __VLS_ctx.reservationStore.isActive),
                });
                /** @type {__VLS_StyleScopedClasses['tier__qty-btn']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "tier__qty-value" },
                });
                /** @type {__VLS_StyleScopedClasses['tier__qty-value']} */ ;
                (__VLS_ctx.quantities[tier.id]);
                __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!!(__VLS_ctx.error))
                                return;
                            if (!(__VLS_ctx.event))
                                return;
                            if (!(__VLS_ctx.event.ticketTiers?.length))
                                return;
                            if (!(tier.available !== 0))
                                return;
                            __VLS_ctx.increment(tier);
                            // @ts-ignore
                            [reservationStore, quantities, quantities, increment,];
                        } },
                    ...{ class: "tier__qty-btn" },
                    'aria-label': "Increase quantity",
                    disabled: (__VLS_ctx.quantities[tier.id] >= __VLS_ctx.maxQty(tier) || __VLS_ctx.reservationStore.isActive),
                });
                /** @type {__VLS_StyleScopedClasses['tier__qty-btn']} */ ;
            }
            // @ts-ignore
            [reservationStore, quantities, maxQty,];
        }
        if (__VLS_ctx.totalSelected > 0 && !__VLS_ctx.reservationStore.isActive) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "reserve-bar" },
            });
            /** @type {__VLS_StyleScopedClasses['reserve-bar']} */ ;
            if (__VLS_ctx.reserveError) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "reserve-bar__error" },
                });
                /** @type {__VLS_StyleScopedClasses['reserve-bar__error']} */ ;
                (__VLS_ctx.reserveError);
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.reserve) },
                ...{ class: "reserve-bar__btn" },
                disabled: (__VLS_ctx.reserving),
            });
            /** @type {__VLS_StyleScopedClasses['reserve-bar__btn']} */ ;
            (__VLS_ctx.reserving ? 'Reserving…' : `Reserve ${__VLS_ctx.totalSelected} ticket${__VLS_ctx.totalSelected !== 1 ? 's' : ''}`);
        }
    }
}
// @ts-ignore
[reservationStore, totalSelected, totalSelected, totalSelected, reserveError, reserveError, reserve, reserving, reserving,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
