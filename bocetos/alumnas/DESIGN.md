---
name: Modern Heritage Studio
colors:
  surface: '#fcf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fcf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#554243'
  inverse-surface: '#31312d'
  inverse-on-surface: '#f3f0ea'
  outline: '#887272'
  outline-variant: '#dbc0c1'
  surface-tint: '#9c4049'
  primary: '#3d000c'
  on-primary: '#ffffff'
  primary-container: '#5d101d'
  on-primary-container: '#e1767e'
  inverse-primary: '#ffb2b6'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#1d1917'
  on-tertiary: '#ffffff'
  tertiary-container: '#322e2b'
  on-tertiary-container: '#9c9591'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb2b6'
  on-primary-fixed: '#40000d'
  on-primary-fixed-variant: '#7e2933'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e9e1dc'
  tertiary-fixed-dim: '#cdc5c0'
  on-tertiary-fixed: '#1e1b18'
  on-tertiary-fixed-variant: '#4b4642'
  background: '#fcf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
typography:
  h1:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  data-tabular:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 32px
  gutter: 24px
  section-gap: 48px
  card-padding: 24px
  stack-sm: 8px
  stack-md: 16px
---

## Brand & Style

This design system is built upon the intersection of rhythmic movement and professional discipline. It avoids the clichés of "orientalism" in favor of a sophisticated, modern heritage aesthetic that respects the cultural roots of Arabic dance while providing a high-performance tool for studio owners.

The brand personality is **stately, welcoming, and precise**. The UI should evoke the feeling of a premium physical studio: the warmth of polished wood, the luxury of heavy fabrics, and the clarity of an open performance floor. We utilize a **Modern-Minimalist** style with subtle **Tactile** accents—specifically gold foil-like borders and cream layering—to ensure the administrative experience feels as curated as the dance forms themselves.

## Colors

The palette is rooted in a "Warm Cream" background to reduce eye strain and provide a more inviting atmosphere than clinical white. 

*   **Deep Burgundy (#5D101D):** Used for primary actions, branding, and high-level navigation backgrounds. It represents the depth and passion of the art form.
*   **Gold (#C5A059):** Applied sparingly for accents, active states, and decorative borders. It serves as a visual reward and denotes premium status.
*   **Warm Cream (#F9F6F0):** The foundational canvas. It provides a "breathable" quality that differentiates the product from standard SaaS platforms.
*   **Text & Data:** Deep Slate is used for readability, ensuring data tables and schedules remain the focal point without the harshness of pure black.

## Typography

This design system employs a high-contrast typographic pairing to balance editorial elegance with functional clarity.

*   **Headings (Noto Serif):** Used for page titles, section headers, and card titles. The serif choice brings a literary and traditional authority to the studio’s identity.
*   **UI & Data (Manrope):** A refined sans-serif selected for its exceptional legibility in dense data environments. It is used for all navigation, form fields, and data tables.
*   **Hierarchy:** Use the `label-caps` style for small metadata and table headers to provide clear structural anchors without overwhelming the layout.

## Layout & Spacing

The layout philosophy emphasizes "the luxury of space." By utilizing a **Fixed Grid** (max-width 1440px) within the main content area, we ensure the studio management tools feel organized rather than cluttered.

*   **Rhythm:** A strict 8px baseline grid governs all vertical movement.
*   **Breathing Room:** We utilize generous 32px outer margins to frame the content, creating a gallery-like feel for the studio's data.
*   **Sidebar:** A narrow, fixed-left navigation keeps the workspace focused, while the 24px gutters between dashboard widgets prevent the "dashboard fatigue" common in management software.

## Elevation & Depth

To maintain a sophisticated and cultural aesthetic, we avoid heavy drop shadows in favor of **Tonal Layers** and **Soft Ambient Occlusion**.

*   **Surface Hierarchy:** The base layer is the Warm Cream background. Secondary surfaces (cards, sidebars) are pure white with a very subtle 1px border in a lightened gold or soft cream.
*   **Shadows:** When necessary for modals or dropdowns, use "Silk Shadows"—highly diffused, low-opacity (8-10%) shadows with a slight burgundy tint (#5D101D) to maintain the warmth of the palette.
*   **Depth through Borders:** We use hairline (1px) borders in Gold to signify interactive elements, creating depth through detail rather than literal 3D elevation.

## Shapes

The shape language is **Soft (Level 1)**. While the studio is a place of fluid movement, the management system must feel architectural and professional.

*   **Corner Radius:** A consistent 0.25rem (4px) radius is applied to primary buttons and input fields to provide a hint of softness while maintaining a sharp, professional edge.
*   **Large Components:** Cards and containers use 0.5rem (8px) to feel more distinct and grounded.
*   **Iconography:** Icons should feature 1.5pt strokes with slightly rounded terminals, mirroring the delicate yet structured nature of the typography.

## Components

### Sidebar Navigation
The sidebar is the anchor of the system. It should use a Deep Burgundy background with icons and text in a muted gold. The "Active" state should be indicated by a vertical gold bar on the left edge and a subtle shift in the background color of the menu item.

### Golden Cards
Data containers (e.g., "Active Members," "Monthly Revenue") are white with a 1px border in Gold (#C5A059). The card title must always use Noto Serif. For premium tiers or special alerts, use a top-border accent (4px) in Burgundy.

### Data Tables
Tables are clean and borderless between rows, using only a subtle Warm Cream row-stripe for readability. Headers are styled with the `label-caps` token in Deep Slate. The primary action in a row (e.g., "Edit Profile") should be a simple text link in Burgundy.

### Buttons
*   **Primary:** Solid Burgundy with White or Gold text. 
*   **Secondary:** Outlined in Gold with Burgundy text. 
*   **Ghost:** Transparent background with Burgundy text, used for less frequent actions.

### Input Fields
Inputs use the Warm Cream background with a bottom-border only (2px) in a light neutral, which transitions to Gold upon focus. This mimics high-end stationery and reinforces the "Elegant" brand pillar.

### Additional Components
*   **Attendance Badge:** A small, circular chip with a Gold border and Burgundy text.
*   **Schedule Blocks:** Use semi-transparent Burgundy fills with sharp borders to represent class times on the calendar view.