# 🧪 Preview Test Guide - Step by Step

## ✅ Preview Button Now Always Visible!

The preview button is now always visible and will show a helpful message if you haven't added content yet.

## 🎯 Step-by-Step Test Instructions

### 1. Open the Application
```
URL: http://localhost:5173/
```

### 2. Navigate to Assets
- Click "Assets" in the left sidebar
- You should see the assets list

### 3. Click "Upload Asset"
- Blue button in the top right corner
- Upload form opens

### 4. Fill in Basic Information

#### Asset Details:
```
Asset Name: Summer Sale Campaign
Asset Type: Image
Asset Category: Marketing
Asset Format: Image
Repository: Content Repository
Status: Draft
Usage Status: Available
QC Score: 85
```

### 5. Select Application Type
```
Application Type: Social Media Marketing
```
- This will show the SMM Application Fields section

### 6. Select Platform
```
Social Media Platform: Facebook / Instagram
```
- The blue Facebook/Instagram section will expand

### 7. Fill in SMM Content

#### Description:
```
🌞 Summer Sale is HERE! 

Get up to 50% OFF on all products! 🎉

✅ Free shipping worldwide
✅ Easy 30-day returns  
✅ 24/7 customer support

Don't miss out! Shop now! 👇
```

#### Hashtags:
```
#SummerSale #Shopping #Deals #Fashion #Sale2024
```

#### Media Type:
```
Select: Image
```

#### Upload Media:
1. Click the "Upload" button
2. Select any image file from your computer
3. Wait for the preview thumbnail to appear

### 8. Click "Preview Facebook/Instagram Post"
- The button should be visible at the bottom of the SMM section
- It's a blue/purple gradient button
- Has an eye icon

### 9. What Should Happen

#### If You Haven't Added Content:
```
Alert: "Please add a description or upload media to preview your post."
```

#### If You Have Content:
- Modal opens immediately
- Shows your content in Facebook/Instagram style
- No demo data
- No delays

## 🎨 What You Should See in Preview

### Modal Header:
```
┌─────────────────────────────────────────┐
│ 👁️ Social Media Post Preview           │
│    Facebook / Instagram              [X]│
└─────────────────────────────────────────┘
```

### Facebook/Instagram Post:
```
┌─────────────────────────────────────────┐
│ [🎨] Summer Sale Campaign ✓             │
│      Just now · 🌐                  ⋮   │
├─────────────────────────────────────────┤
│                                         │
│ 🌞 Summer Sale is HERE!                │
│                                         │
│ Get up to 50% OFF on all products! 🎉  │
│                                         │
│ ✅ Free shipping worldwide              │
│ ✅ Easy 30-day returns                  │
│ ✅ 24/7 customer support                │
│                                         │
│ Don't miss out! Shop now! 👇           │
│                                         │
│ #SummerSale #Shopping #Deals #Fashion  │
│ #Sale2024                               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      [YOUR UPLOADED IMAGE]              │
│                                         │
├─────────────────────────────────────────┤
│ 👍❤️😊 1.2K    89 comments · 24 shares │
├─────────────────────────────────────────┤
│  👍 Like   💬 Comment   ↗️ Share       │
├─────────────────────────────────────────┤
│ [👤] Write a comment...                │
└─────────────────────────────────────────┘
```

## 🔍 Troubleshooting

### Problem: Preview button not visible
**Solution:**
- Make sure you selected "Social Media Marketing" as Application Type
- Make sure you selected a platform (Facebook/Instagram, Twitter, or LinkedIn)
- Scroll down to the bottom of the SMM section

### Problem: Alert says "Please add description or media"
**Solution:**
- Add text in the Description field, OR
- Upload an image/video using the Media Upload button
- You need at least one of these to preview

### Problem: Preview shows empty content
**Solution:**
- Make sure you filled in the Description field
- Make sure you added Hashtags
- Make sure you uploaded media
- Check that the content was saved (not just typed)

### Problem: Modal doesn't open
**Solution:**
- Check browser console for errors (F12)
- Refresh the page and try again
- Make sure JavaScript is enabled
- Try a different browser

### Problem: Image doesn't show in preview
**Solution:**
- Make sure you clicked "Upload" button after selecting the file
- Wait for the thumbnail preview to appear before clicking preview
- Check that the file is a valid image format (JPG, PNG, GIF)
- Try a smaller image file (under 5MB)

## ✅ Success Checklist

When testing, verify:

- [ ] Preview button is visible at bottom of SMM section
- [ ] Button has blue/purple gradient
- [ ] Button has eye icon
- [ ] Clicking button opens modal
- [ ] Modal shows your asset name
- [ ] Modal shows your description
- [ ] Modal shows your hashtags in blue
- [ ] Modal shows your uploaded image
- [ ] Modal has realistic Facebook/Instagram design
- [ ] Close button (X) works
- [ ] Clicking outside modal closes it
- [ ] No errors in console

## 📝 Quick Test Content

### Minimal Test:
```
Description: "Test post! 🎉"
Hashtags: "#Test"
Image: [Any image]
```

### Full Test:
```
Asset Name: "Holiday Campaign"
Description: "🎄 Holiday Sale! Get 40% OFF! 🎁\n\n✅ Limited time\n✅ Free gift wrap\n\nShop now!"
Hashtags: "#Holiday #Sale #Gifts #Christmas"
Image: [Holiday themed image]
```

## 🎯 Expected Behavior

### Button Click:
1. Click "Preview Facebook/Instagram Post"
2. Modal opens instantly (no delay)
3. Your content displays immediately
4. Realistic Facebook/Instagram design
5. All your content is visible

### Modal Interaction:
1. Click X button → Modal closes
2. Click outside modal → Modal closes
3. Scroll inside modal → Content scrolls
4. All buttons have hover effects

## 🚀 Ready to Test!

Follow the steps above and your preview should work perfectly!

If you encounter any issues:
1. Check the troubleshooting section
2. Verify you followed all steps
3. Check browser console for errors
4. Try refreshing the page

The preview should open immediately and show your content in a beautiful, realistic Facebook/Instagram post design! 🎨✨
