# Changelog

All notable changes to this project will be documented in this file.

This file is auto-generated from conventional commits. Do not edit it manually.
## [Unreleased]

### Added

- Add splash screen

- Onboarding screen

- Role selection page

- Authentication pages with validation

- Forget password otp pages

- Continue as guest

- Bottom navigation bar

- Getting started page

- Initial homepage

- Category section

- *(guest)* Popular provider section

- Add sticky header

- Guest home page

- Be provider page

- *(customer-ui)* Recent booking section

- Booking list

- Favourite providers

- Notifications page

- Provider and booking confirmation

- Provider home page

- Provider booking screen

- Earnings dashboard

- Empty service screen page

- Provider service screen

- Account menu

- Service form

- Add service package in service form

- Billing basis guideline modal

- Account form

- Add avatar addition section

- Password update form

- Identity verification section

- Booking stepper

- Booking detail

- Status reason card

- Onboarding forms

- Add remaining settings related pages

- Integrate authentication

- Load images from s3

- Onboarding and otp

- *(earnings,profile)* Implement earnings page using commissions api, fix provider profile edit avatar validation

- *(favourites)* Implement customer favourites integration with skeleton loader, empty SVG illustration, and segregated types

- Service edit form

- Service provider listing

- Add booking API layer with types, actions, and hooks for bookings, invoices, coupons, payments, ratings, and download

- Integrate My Reviews page with real API, add edit/delete, fix scrollability

- Update booking detail screen with call/map actions, discount UI, payment options

- *(provider)* Integrate real API for bookings, fix account crash, align detail page design

- Add provider reviews screen, refactor both sides to LoadMoreList

- Integrate in-app notifications API + local device notification service

- Fetch service categories from API, show random chips in hero, hide section when empty

- Category filter navigation from home, tighter spacing, fix search bar redirect

- Provider dashboard

- Blogs

- Google maps integration

- Posthog

- Role switching

- Role switching

- Search by map

- Integrate search by map

- Map changes

- Onboarding simplification

- Map clustering

- Accessibility audit, bottom nav fix, lint cleanup

- *(map)* Optimize mobile search-by-map with geohash quantization, 500ms debounce, and 120px collision-free clustering

- *(services)* Expand search bar and extract filters/map toolbar in FindServicesScreen

- *(services)* Redesign map view floating controls and add category modal

- *(services)* Render empty state visual for missing work experience and education

- *(map)* Add radius search filter to mobile app store, modal, and map screen


### Fixed

- Infer proper type for timeout state

- Show notification for customer in search page

- Font mismatch between pages

- Wrong navigation for booking detail

- Service page top padding

- Missing type header

- Authentication presistence

- Hardcoded navigation routes

- Add interceptor that cleans signed url query

- *(profile)* Conditionally omit avatar from update profile payload if null to satisfy api validator constraints

- Improper payload for experience and skills

- Onboarding logic

- ProviderAccountScreen avg_rating string crash

- Remove white circle from bell icon, clear query cache on logout, add notification badge to all screens

- Make get started button sticky and fix content layout

- Input text not visible in android devices

- Shadow elevation issue

- Api routes

- Posthog provider

- Langauge selector component mount

- Role switching fixes

- Use coordinates

- Remove posthog production flag check

- Maps

- Profile completition card

- Unboarding

- Phone Number Field

- Reset password failing due to consumed OTP

- *(services)* Prevent 'No reviews' label container overflow on ProviderHeaderCard

- *(onboarding)* Prevent route reset and preserve step state on profile save

- *(map)* Optimize safe area padding and remove deprecated safe-area-view imports

- *(services)* Update individual service pricing color to primary and remove heavy item shadows

- *(home)* Add containerClassName prop to Input and adjust search bar internal padding

- *(services)* Prevent provider name and verified badge wrapping on long names

- *(services)* Refine provider details and ratings query execution gating

- Layouts

- Animations and input fields

- Tabs

- Gesture navigation black border

- Drawer scrolling

- *(ui)* Navigation margins

- Updates

- *(auth)* Fix terms of service text clipping and inline spacing on signup screen

- *(ui)* Remove Android bottom drop shadow artifact on sticky CTA footers

- *(ui)* Prevent bottom text clipping on home service category cards


### Refactored

- Fonts

- Onboarding

- Centralize image loading

- Routes

- Header

- Reogranize structure

- Header

- Provider card

- Folder structur

- Replace skeleton loaders with ActivityIndicator in customer screens

- File structure

- Cleanup

- Code

- Payments

- Optimizations and cleanups


### Miscellaneous

- Add design styles

- Setup font for application

- Add localization support

- Update onboarding text size

- Add prettier ignore

- Add password indicators

- Improve authentication pages ui

- Simpler animation for role seleciton

- Define standard font sizes

- Font adjustments

- Adjust footer size

- Change input field height

- Booking ui changes

- Update gitignore

- Remove auth docs reference

- Translations

- Translations

- Translations and map improvements

- Update maps with webview for now

- Android ui eleveation fixes

- Update illustrations and translations

- Remove overengineering

- Add logging for local and dev environment

- Optimizations, refactoring

- Add missing translations

- Rename app to Sewalo and bump expo dependencies

- Add changelog generation and commit linting

- Install pnpm prior to setup-node in workflows

- Specify packageManager in package.json and pnpm version in workflows

- Use Node 24 and native corepack for pnpm in workflows

- Update actions/checkout to v4.2.2 and actions/setup-node to v4.2.0

- Remove hero title and subtitle

- Update icons

- Quality updates

- Update env format

<!-- generated by git-cliff -->
