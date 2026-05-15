<script setup>
import { computed } from 'vue'
import { resolveCardBrand } from '@/subscription/domain/model/billing-setup-entity.js'

const props = defineProps({
    brand: { type: String, required: true }
})

const brandInfo = computed(() => resolveCardBrand(props.brand))
const isVisa = computed(() => brandInfo.value.id === 'visa')
const isMastercard = computed(() => brandInfo.value.id === 'mastercard')
const isAmericanExpress = computed(() => brandInfo.value.id === 'american-express')
const isDinersClub = computed(() => brandInfo.value.id === 'diners-club')
const isDiscover = computed(() => brandInfo.value.id === 'discover')
const isJcb = computed(() => brandInfo.value.id === 'jcb')
const isUnionPay = computed(() => brandInfo.value.id === 'unionpay')
</script>

<template>
    <span
        class="card-brand-badge"
        :class="{
            'card-brand-badge--visa': isVisa,
            'card-brand-badge--mastercard': isMastercard,
            'card-brand-badge--amex': isAmericanExpress,
            'card-brand-badge--diners': isDinersClub,
            'card-brand-badge--discover': isDiscover,
            'card-brand-badge--jcb': isJcb,
            'card-brand-badge--unionpay': isUnionPay
        }"
        :aria-label="brandInfo.ariaLabel"
        :title="brandInfo.label"
    >
        <span v-if="isMastercard" class="mastercard-mark" aria-hidden="true">
            <span></span>
            <span></span>
        </span>
        <span v-else aria-hidden="true">{{ brandInfo.shortLabel }}</span>
    </span>
</template>

<style scoped>
.card-brand-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 58px;
    height: 30px;
    border: 1px solid #d8d0ca;
    border-radius: 9px;
    background: #f7f3ef;
    color: #5f554e;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0;
    line-height: 1;
    padding: 0 8px;
}

.card-brand-badge--visa {
    border-color: #1a46a0;
    background: #ffffff;
    color: #1a46a0;
    font-style: italic;
}

.card-brand-badge--mastercard {
    border-color: #e6b381;
    background: #ffffff;
}

.card-brand-badge--amex {
    border-color: #2e77bb;
    background: #2e77bb;
    color: #ffffff;
}

.card-brand-badge--diners {
    border-color: #1167a8;
    background: #ffffff;
    color: #1167a8;
}

.card-brand-badge--discover {
    border-color: #f58220;
    background: #fff5eb;
    color: #7a3300;
}

.card-brand-badge--jcb {
    border-color: #0c7c59;
    background: linear-gradient(90deg, #0b60b0 0 33%, #0c7c59 33% 66%, #c8282f 66%);
    color: #ffffff;
}

.card-brand-badge--unionpay {
    border-color: #0d5fa6;
    background: #ffffff;
    color: #0d5fa6;
}

.mastercard-mark {
    position: relative;
    width: 34px;
    height: 20px;
}

.mastercard-mark span {
    position: absolute;
    top: 1px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
}

.mastercard-mark span:first-child {
    left: 3px;
    background: #eb001b;
}

.mastercard-mark span:last-child {
    right: 3px;
    background: rgb(247 158 27 / 86%);
}
</style>
