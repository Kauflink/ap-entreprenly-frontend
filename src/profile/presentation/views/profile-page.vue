<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import useProfileStore from '@/profile/application/profile.store.js'
import UserInfoCard from '@/profile/presentation/components/user-info-card.vue'
import UploadPhotoCard from '@/profile/presentation/components/upload-photo-card.vue'
import UpdateProfileCard from '@/profile/presentation/components/update-profile-card.vue'
import PhoneVerifyCard from '@/profile/presentation/components/phone-verify-card.vue'
import PreferencesCard from '@/profile/presentation/components/preferences-card.vue'
import EmailChangeCard from '@/profile/presentation/components/email-change-card.vue'
import NotificationsCard from '@/profile/presentation/components/notifications-card.vue'
import ChangePasswordCard from '@/profile/presentation/components/change-password-card.vue'

const { t } = useI18n()
const profileStore = useProfileStore()

onMounted(() => {
    profileStore.loadProfile()
})
</script>

<template>
    <main class="page" :aria-label="t('profile.page.ariaLabel')">
        <div class="grid">
            <section class="col col--left" :aria-label="t('profile.page.leftSectionLabel')">
                <UserInfoCard class="user-info" />
                <UploadPhotoCard class="upload-photo" />
            </section>

            <section class="col col--center" :aria-label="t('profile.page.centerSectionLabel')">
                <UpdateProfileCard class="update-profile" />
                <PhoneVerifyCard class="phone-verify" />
            </section>

            <section class="col col--right" :aria-label="t('profile.page.rightSectionLabel')">
                <PreferencesCard />
                <EmailChangeCard />
            </section>

            <div class="row row--bottom">
                <NotificationsCard />
                <ChangePasswordCard />
            </div>
        </div>
    </main>
</template>

<style scoped>
.page {
    background: var(--color-bg-page);
    box-sizing: border-box;
    display: flex;
    min-height: 0;
}

.grid {
    display: grid;
    flex: 1;
    grid-template-columns: 481fr 446fr 502fr;
    grid-template-rows: minmax(0, 498fr) minmax(0, 423fr);
    grid-template-areas:
        'left center right'
        'bottom bottom bottom';
    column-gap: 24px;
    row-gap: 25px;
    max-width: 1510px;
    width: 100%;
    margin: 0 auto;
    align-items: stretch;
    min-height: 0;
}

.col {
    display: flex;
    flex-direction: column;
    gap: 25px;
    min-height: 0;
}

.col--left {
    grid-area: left;
}
.col--center {
    grid-area: center;
}
.col--right {
    grid-area: right;
    gap: 10px;
}

.col--left > .user-info {
    flex: 2 1 0;
    min-height: 0;
}
.col--left > .upload-photo {
    flex: 3 1 0;
    min-height: 0;
}
.col--center > .update-profile {
    flex: 3 1 0;
    min-height: 0;
}
.col--center > .phone-verify {
    flex: 2 1 0;
    min-height: 0;
}

.row--bottom {
    grid-area: bottom;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: stretch;
    min-height: 0;
}

@media (max-width: 1200px) {
    .grid {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto auto;
        grid-template-areas:
            'left center'
            'right right'
            'bottom bottom';
    }

    .col--left > .user-info,
    .col--left > .upload-photo,
    .col--center > .update-profile,
    .col--center > .phone-verify {
        flex: 0 0 auto;
    }
}

@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
        grid-template-areas:
            'left'
            'center'
            'right'
            'bottom';
    }

    .row--bottom {
        grid-template-columns: 1fr;
    }
}
</style>
