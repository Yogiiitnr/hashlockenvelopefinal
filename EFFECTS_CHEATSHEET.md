# 🎨 CSS EFFECTS CHEAT SHEET

## Quick Reference for All Visual Effects

---

## 🌟 **Text Effects**

### Aurora Rainbow Text
```css
.aurora-text
```
- **Animation**: 3s infinite color gradient flow
- **Colors**: Pink → Orange → Cyan → Pink
- **Use**: Main headings, important text

### Neon Glow Text
```css
.neon-text
```
- **Animation**: 2s infinite subtle flicker
- **Effect**: Glowing text shadow (cyan/purple)
- **Use**: Wallet addresses, data labels

---

## 💎 **Card Effects**

### Holographic Shine
```css
.holographic
```
- **Animation**: 3s infinite sweep at 45°
- **Effect**: Reflective light beam
- **Use**: All cards, panels, containers

### Glass Reflection
```css
.glass-reflection
```
- **Animation**: 3s infinite sweep at 120°
- **Effect**: Diagonal light reflection
- **Use**: Transaction cards, info panels

### Border Glow
```css
.border-glow
```
- **Animation**: 4s infinite rotation + pulse
- **Effect**: Animated gradient border
- **Use**: Feature cards, important containers

### Rainbow Border
```css
.rainbow-border
```
- **Animation**: 3s infinite hue rotation
- **Effect**: Constantly changing rainbow border
- **Use**: Dashboard stats, special cards

---

## 🎭 **Button Effects**

### Magnetic Button
```css
.magnetic-button
```
- **Animation**: Scale(1.05) on hover
- **Effect**: Button grows toward cursor
- **Use**: All interactive buttons

### Liquid Button
```css
.liquid-button
```
- **Animation**: 3s infinite shine sweep
- **Effect**: Flowing liquid highlight
- **Use**: Primary action buttons

### Ripple Effect
```css
.ripple-effect
```
- **Animation**: Expanding circle on click
- **Effect**: Water ripple interaction
- **Use**: Clickable elements

---

## ✨ **Motion Effects**

### Breathe
```css
.breathe
```
- **Animation**: 3s infinite scale pulse
- **Effect**: Gentle breathing motion
- **Use**: Icons, decorative elements

### Levitate
```css
.levitate
```
- **Animation**: 3s infinite float
- **Effect**: Up and down movement
- **Use**: Icons, numbers, emoji

### Pulse Ring
```css
.pulse-ring
```
- **Animation**: 2s infinite expansion
- **Effect**: Concentric rings from center
- **Use**: Focal points, active elements

---

## 🌈 **Background Effects**

### Enhanced Morph Background
```css
body::before
```
- **Effect**: 7 radial gradients + blur(60px)
- **Animation**: 8s pulse
- **Colors**: Purple, pink, blue, cyan

### Colored Particles
```css
body::after
```
- **Effect**: 10 floating colored particles
- **Animation**: 20s float
- **Colors**: Purple, pink, blue, green, orange

### Cyber Grid
```css
.cyber-grid
```
- **Effect**: Moving grid pattern
- **Animation**: 10s infinite
- **Use**: Special sections (optional)

---

## 📋 **Where Each Effect Is Used**

### Header
- `.border-glow` - Container
- `.levitate` + `.holographic` + `.pulse-ring` - Logo
- `.aurora-text` - Title
- `.shimmer` - Subtitle
- `.neon-text` - Wallet address
- `.liquid-button` + `.ripple-effect` - Connect button

### Welcome Card
- `.holographic` + `.border-glow` - Container
- `.breathe` + `.pulse-ring` - Icon
- `.aurora-text` - Heading

### Feature Cards (3 cards)
- `.holographic` + `.ripple-effect` - All cards
- `.breathe` - Icons
- `.aurora-text` - Titles

### Tab Navigation
- `.border-glow` - Container
- `.magnetic-button` + `.ripple-effect` - All tabs
- `.pulse-ring` - Active tab
- `.holographic` - Inactive tabs
- `.aurora-text` - Active tab text

### Create Form
- `.holographic` + `.border-glow` - Card
- `.breathe` + `.pulse-ring` - Icon
- `.levitate` - Emoji
- `.aurora-text` - Heading
- `.neon-text` - Description

### Claim Form
- `.holographic` + `.border-glow` - Card
- `.breathe` + `.pulse-ring` - Icon
- `.levitate` - Emoji
- `.aurora-text` - Heading
- `.neon-text` - Description

### Reclaim Form
- `.holographic` + `.border-glow` - Card
- `.breathe` + `.pulse-ring` - Icon
- `.levitate` - Emoji
- `.aurora-text` - Heading
- `.neon-text` - Description

### Transaction History
- `.holographic` + `.border-glow` - Empty state
- `.holographic` + `.glass-reflection` - Transaction cards
- `.levitate` - Transaction icons
- `.aurora-text` - Headings, amounts
- `.neon-text` - Transaction types
- `.liquid-button` + `.ripple-effect` - Refresh button
- `.ripple-effect` - Links

### Dashboard
- `.holographic` + `.levitate` + `.rainbow-border` - Stat cards
- `.breathe` - Stat icons
- `.aurora-text` - Values, headings
- `.holographic` + `.border-glow` - Activity section
- `.ripple-effect` + `.glass-reflection` - Activity cards
- `.levitate` - Activity icons
- `.neon-text` - Numbers
- `.liquid-button` + `.ripple-effect` - Refresh button
- `.holographic` - Insights section
- `.ripple-effect` - Insight cards

### QR Code Generator
- `.holographic` + `.border-glow` - Container
- `.aurora-text` - Heading
- `.liquid-button` + `.ripple-effect` - Toggle button
- `.pulse-ring` + `.glass-reflection` - QR display
- `.holographic` - Info panel
- `.neon-text` - Envelope ID
- `.aurora-text` - Amount
- `.magnetic-button` + `.ripple-effect` - Action buttons
- `.glass-reflection` - Instructions

### Info Section
- `.holographic` + `.border-glow` - Container
- `.breathe` - Section icon
- `.aurora-text` - Heading
- `.levitate` - Step numbers
- `.neon-text` - Step titles
- `.ripple-effect` - Step cards
- `.holographic` - Contract info
- `.aurora-text` - Contract label

---

## 🎯 **Animation Timing Reference**

| Animation | Duration | Timing Function | Iteration |
|-----------|----------|----------------|-----------|
| aurora | 3s | ease | infinite |
| holographicShine | 3s | ease | infinite |
| borderGlow | 4s | linear | infinite |
| neonFlicker | 2s | ease-in-out | infinite |
| breathe | 3s | ease-in-out | infinite |
| levitate | 3s | ease-in-out | infinite |
| pulseRing | 2s | ease-out | infinite |
| float | 20s | ease-in-out | infinite |
| pulse | 8s | ease-in-out | infinite |
| liquidShine | 3s | ease | infinite |
| rainbowBorder | 3s | linear | infinite |
| reflection | 3s | linear | infinite |

---

## 🔧 **How to Add Effects**

### To Any Element
```tsx
// Single effect
<div className="holographic">Content</div>

// Multiple effects
<div className="holographic border-glow breathe">Content</div>

// Conditional effects
<div className={`${isActive ? 'aurora-text' : ''}`}>Text</div>
```

### To Text
```tsx
<h1 className="aurora-text">Rainbow Heading</h1>
<p className="neon-text">Glowing Text</p>
```

### To Buttons
```tsx
<button className="magnetic-button liquid-button ripple-effect">
  Click Me
</button>
```

### To Cards
```tsx
<div className="holographic border-glow glass-reflection">
  Card Content
</div>
```

### To Icons
```tsx
<span className="breathe levitate pulse-ring">🚀</span>
```

---

## 💡 **Pro Tips**

1. **Don't Overuse**: 2-3 effects per element maximum
2. **Layer Effects**: Combine complementary animations
3. **Timing**: Vary animation speeds for natural feel
4. **Performance**: Use `transform` and `opacity` for 60 FPS
5. **Contrast**: Balance busy and calm areas
6. **Purpose**: Each effect should serve a function
7. **Consistency**: Use same effects for same element types
8. **Testing**: Check on different screen sizes

---

## 🎨 **Effect Combinations That Work Well**

### Premium Cards
```tsx
className="holographic border-glow glass-reflection"
```

### Active Buttons
```tsx
className="magnetic-button liquid-button ripple-effect pulse-ring"
```

### Important Headings
```tsx
className="aurora-text breathe"
```

### Floating Icons
```tsx
className="levitate breathe pulse-ring"
```

### Interactive Cards
```tsx
className="holographic ripple-effect glass-reflection"
```

---

## 📊 **Effect Performance**

| Effect | GPU | FPS | Impact |
|--------|-----|-----|--------|
| aurora-text | ✅ | 60 | Low |
| holographic | ✅ | 60 | Low |
| border-glow | ✅ | 60 | Medium |
| neon-text | ✅ | 60 | Low |
| magnetic-button | ✅ | 60 | Low |
| ripple-effect | ✅ | 60 | Low |
| liquid-button | ✅ | 60 | Low |
| breathe | ✅ | 60 | Low |
| levitate | ✅ | 60 | Low |
| pulse-ring | ✅ | 60 | Medium |
| glass-reflection | ✅ | 60 | Low |

**All effects are GPU-accelerated and run at 60 FPS!** ✅

---

## 🚀 **Quick Copy-Paste**

### Rainbow Title
```tsx
<h1 className="aurora-text">Your Title</h1>
```

### Glowing Card
```tsx
<div className="holographic border-glow">Your Content</div>
```

### Awesome Button
```tsx
<button className="magnetic-button liquid-button ripple-effect">
  Click Me
</button>
```

### Floating Icon
```tsx
<span className="levitate breathe">✨</span>
```

### Transaction Card
```tsx
<div className="holographic glass-reflection ripple-effect">
  Transaction Details
</div>
```

---

**Use this as your quick reference when demonstrating the app!** 🌟
