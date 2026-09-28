# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Customers of Optical G&S, an optician in Casablanca (Californie). Mostly Moroccan shoppers, often on a phone and often arriving from Instagram or WhatsApp, who want a good-looking pair of prescription frames or sunglasses at a fair price. They leave by placing an order (cash on delivery), or less often by booking an eye exam or visiting the store.

## Product Purpose

The shop's own website: a real online boutique of 542 frames from the shop's catalogue API, plus booking, store and contact information. Success is a visitor who finds a frame they like and sends an order. Booking an appointment and visiting the store are secondary paths (confirmed: "buy frames online" is the main goal).

## Positioning

Designer frames (Vogue, Bvlgari, Guess, Fendi, Gucci, Dior, Prada and more) with advice from a qualified optician, at accessible prices (up to 30% off), delivered across Morocco with cash on delivery.

## Operating Context

- Six routes: `/`, `/boutique`, `/boutique/panier`, `/rendez-vous`, `/a-propos`, `/contact`, plus a 404.
- No backend. Orders, bookings and messages compose an email or a WhatsApp message on the visitor's own device.
- Delivery cities and fees: Casablanca 30 MAD, Rabat 40, Marrakech, Tanger, Fès 50.
- Open Monday to Saturday, 10:00 à 20:00; closed Sunday; WhatsApp 7 days.

## Capabilities and Constraints

- React 19 + Vite 7, plain CSS, GSAP and Lenis. No routing library, no UI kit, no CSS framework.
- Design tokens are required: the owner expects to change colours, type and spacing later, so every visual value lives in one token layer.
- French (source) and English, switchable, same content shape.
- The light/dark theme toggle is not kept (redesign decision, 2026-09-28).
- The shop, cart and forms must stay fast and simple: expressive treatment belongs to Home and About.

## Brand Commitments

- Name Optical G&S; tagline "Vos yeux méritent le mieux".
- Brand colours: gold `#E8C351`, ink `#14171A`, white. The spectacles logo (`Design Assest/Logo.svg`).
- Every section label carries the spectacles mark (client rule).
- No dash as a connector in user-facing copy: no em dash, no en dash, no double hyphen (client rule).
- Redesign direction pinned by the owner: inspired by the Devorise Media website's design language, carried in Optical G&S gold and ink.

## Evidence on Hand

- 542 frames with brand, reference, price, gender, type, colour, material, measurements and stock (`src/data/products.json`), photographs in `public/products/`.
- Store photographs, founder photograph, six category photographs (`public/media/`).
- Founder: Sara Ghanem, qualified optician, more than 10 years.
- Absent, never to be invented: reviews or testimonials, customer counts, a "featured" flag, a UV flag.

## Accessibility & Inclusion

WCAG AA contrast, visible focus, keyboard paths, real buttons and links, `prefers-reduced-motion` respected everywhere, no horizontal overflow from 360px up.
