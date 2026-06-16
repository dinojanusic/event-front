import { ref } from 'vue';
import { RouterLink, onBeforeRouteLeave } from 'vue-router';
import { useReservation } from '../composables/useReservation';
import { placeOrder as apiPlaceOrder, releaseReservation, ReservationExpiredError, } from '../api/reservations';
const { secondsLeft, countdownDisplay, expired, store } = useReservation();
const email = ref('');
const placing = ref(false);
const orderError = ref(null);
const confirmed = ref(false);
const orderNumber = ref(null);
function formatPrice(amount, currency) {
    if (amount == null || amount === 0)
        return 'Free';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency ?? 'USD',
    }).format(amount);
}
function formatTotal() {
    const items = store.items;
    if (!items.length)
        return '';
    const currency = items[0].currency ?? 'USD';
    const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
    return formatPrice(total, currency);
}
async function placeOrder() {
    placing.value = true;
    orderError.value = null;
    try {
        let lastOrderNumber = null;
        // Backend is one-reservation-per-order; place sequentially for multi-tier
        for (const item of store.items) {
            const data = await apiPlaceOrder(item.uuid, email.value);
            lastOrderNumber = data.orderNumber;
        }
        store.clear();
        orderNumber.value = lastOrderNumber;
        confirmed.value = true;
    }
    catch (e) {
        if (e instanceof ReservationExpiredError) {
            store.clear();
            expired.value = true;
        }
        else {
            orderError.value = e instanceof Error ? e.message : String(e);
        }
    }
    finally {
        placing.value = false;
    }
}
// Release the hold when the user navigates away without completing the order.
// Fire-and-forget: Vue Router won't await this; backend TTL is the safety net.
onBeforeRouteLeave(() => {
    if (confirmed.value || !store.hasReservation)
        return;
    const uuids = store.items.map(i => i.uuid);
    store.clear();
    Promise.allSettled(uuids.map(releaseReservation));
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['checkout__expired']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout__expired']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout__header']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout__input']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout__input']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout__confirmed']} */ ;
/** @type {__VLS_StyleScopedClasses['checkout']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "checkout" },
});
/** @type {__VLS_StyleScopedClasses['checkout']} */ ;
if (!__VLS_ctx.expired && !__VLS_ctx.store.hasReservation) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "checkout__empty" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__empty']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    let __VLS_0;
    /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "checkout__back-link" },
        to: "/",
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "checkout__back-link" },
        to: "/",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['checkout__back-link']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    // @ts-ignore
    [expired, store,];
    var __VLS_3;
}
else if (__VLS_ctx.expired) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "checkout__expired" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__expired']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "checkout__expired-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__expired-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    let __VLS_6;
    /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        ...{ class: "checkout__btn checkout__btn--secondary" },
        to: "/",
    }));
    const __VLS_8 = __VLS_7({
        ...{ class: "checkout__btn checkout__btn--secondary" },
        to: "/",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['checkout__btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['checkout__btn--secondary']} */ ;
    const { default: __VLS_11 } = __VLS_9.slots;
    // @ts-ignore
    [expired,];
    var __VLS_9;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "checkout__header" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "checkout__timer" },
        ...{ class: ({ 'checkout__timer--urgent': __VLS_ctx.secondsLeft < 60 }) },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__timer']} */ ;
    /** @type {__VLS_StyleScopedClasses['checkout__timer--urgent']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "checkout__countdown" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__countdown']} */ ;
    (__VLS_ctx.countdownDisplay);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "checkout__body" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "checkout__summary" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__summary']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "checkout__item-list" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__item-list']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.store.items))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (item.uuid),
            ...{ class: "checkout__item" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "checkout__item-info" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__item-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "checkout__item-name" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__item-name']} */ ;
        (item.tierName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "checkout__item-qty" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__item-qty']} */ ;
        (item.quantity);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "checkout__item-price" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__item-price']} */ ;
        (__VLS_ctx.formatPrice(item.price * item.quantity, item.currency));
        // @ts-ignore
        [store, secondsLeft, countdownDisplay, formatPrice,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "checkout__total" },
    });
    /** @type {__VLS_StyleScopedClasses['checkout__total']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatTotal());
    if (!__VLS_ctx.confirmed) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "checkout__form" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__form']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
            ...{ onSubmit: (__VLS_ctx.placeOrder) },
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "checkout__field" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            for: "email",
            ...{ class: "checkout__label" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            id: "email",
            ...{ class: "checkout__input" },
            type: "email",
            required: true,
            autocomplete: "email",
            placeholder: "you@example.com",
            disabled: (__VLS_ctx.placing),
        });
        (__VLS_ctx.email);
        /** @type {__VLS_StyleScopedClasses['checkout__input']} */ ;
        if (__VLS_ctx.orderError) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "checkout__error" },
            });
            /** @type {__VLS_StyleScopedClasses['checkout__error']} */ ;
            (__VLS_ctx.orderError);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            type: "submit",
            ...{ class: "checkout__btn checkout__btn--primary" },
            disabled: (__VLS_ctx.placing),
        });
        /** @type {__VLS_StyleScopedClasses['checkout__btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['checkout__btn--primary']} */ ;
        (__VLS_ctx.placing ? 'Placing order…' : 'Place Order');
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "checkout__confirmed" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__confirmed']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "checkout__confirmed-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['checkout__confirmed-icon']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.orderNumber);
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.email);
        let __VLS_12;
        /** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
        RouterLink;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            ...{ class: "checkout__btn checkout__btn--secondary" },
            to: "/",
        }));
        const __VLS_14 = __VLS_13({
            ...{ class: "checkout__btn checkout__btn--secondary" },
            to: "/",
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        /** @type {__VLS_StyleScopedClasses['checkout__btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['checkout__btn--secondary']} */ ;
        const { default: __VLS_17 } = __VLS_15.slots;
        // @ts-ignore
        [formatTotal, confirmed, placeOrder, placing, placing, placing, email, email, orderError, orderError, orderNumber,];
        var __VLS_15;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
