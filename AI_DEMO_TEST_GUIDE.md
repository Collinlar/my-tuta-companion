# 🧪 AI Personalization Demo - Testing Guide

## 🚀 How to Test the Profile-Aware AI Demo

### **Method 1: Through Profile Page (Recommended)**

1. **Complete Onboarding First** (if not done):
   - Go through the onboarding process
   - Fill in your profile information (name, school, class, subjects, goals)
   - This data will be used by the AI for personalization

2. **Access Profile Page**:
   - Navigate to **Profile** in the sidebar menu
   - You'll see your profile information and settings

3. **Launch Demo**:
   - Scroll down to the **"AI Personalization"** section
   - Click the **"See AI Personalization in Action"** button
   - This will open the interactive demo

### **Method 2: Direct Demo Access**

1. **Use Sidebar Menu**:
   - Look for **"AI Demo"** in the sidebar menu
   - Click it to access the demo directly

### **Method 3: Programmatic Testing**

You can also test programmatically by navigating to the demo view:

```typescript
// In your browser console or component
setCurrentView('demo');
```

## 🎯 What to Test

### **1. Profile Context Display**
- ✅ Verify your profile information is displayed correctly
- ✅ Check that grade level, subjects, and goals are shown
- ✅ Ensure the profile context is accurate
- ✅ Verify Ghana curriculum context is included

### **2. AI Content Generation**
- ✅ **Input Test Data**: 
  ```
  Topic: Photosynthesis
  Notes: Photosynthesis is the process by which plants convert sunlight into energy. This process occurs in the chloroplasts of plant cells and involves the absorption of light energy by chlorophyll pigments.
  ```

- ✅ **Generate Content**: Click "Generate Profile-Aware Content"
- ✅ **Check Results**: Look for:
  - **Learning Path**: Steps should be appropriate for your grade level with Ghana context
  - **Quiz Questions**: Should reference your subjects, goals, and Ghana examples
  - **Flashcards**: Should include study tips aligned with your goals and Ghana curriculum
  - **Ghana Context**: Content should include Ghana-specific examples and references

### **3. Personalization Verification**

Look for these personalization elements in generated content:

#### **Grade Level Personalization**:
- **Grade 7**: Beginner language, simple explanations
- **Grade 9**: Intermediate concepts, more detailed explanations  
- **Grade 10-11**: Advanced concepts, critical thinking focus
- **Grade 12**: University-level preparation, complex problem-solving

#### **Subject Integration**:
- Content should reference your specific subjects when relevant
- Examples should align with your academic focus and Ghana curriculum

#### **Ghana Context Integration**:
- **Local Examples**: References to Ghanaian cities, landmarks, and culture
- **Curriculum Alignment**: Content aligned with Ghana Education Service (GES) standards
- **Exam Context**: References to BECE (Grade 9) and WASSCE (Grade 12) preparation
- **Cultural Relevance**: Examples that resonate with Ghanaian students

#### **Goal Alignment**:
- **BECE Goals**: Content should help with comprehensive exam prep
- **WASSCE Goals**: Advanced problem-solving and analysis
- **University Prep**: Foundation-building for higher education

### **4. Error Handling**
- ✅ Test with empty inputs (should disable button)
- ✅ Test with invalid data (should show fallback content)
- ✅ Test network issues (should show appropriate error messages)

## 🔍 What to Look For

### **Expected Personalization Features**:

1. **Difficulty Adjustment**:
   - Grade 7-9 students get simpler language and concepts
   - Grade 10-12 students get more complex, analytical content

2. **Subject Context**:
   - Math students see mathematical examples
   - Science students get scientific applications
   - English students focus on language skills

3. **Goal Integration**:
   - BECE students get exam-focused content
   - University-bound students get advanced preparation

4. **Study Tips**:
   - Tips should be specific to your goals and subjects
   - Advice should match your academic level

## 🐛 Troubleshooting

### **If Demo Doesn't Load**:
1. Check browser console for errors
2. Verify profile data exists in localStorage
3. Ensure you've completed onboarding

### **If AI Generation Fails**:
1. Check network connection
2. Verify Groq API key is configured
3. Look for fallback content (should still work)

### **If Personalization Seems Wrong**:
1. Check your profile data is complete
2. Verify grade level is set correctly
3. Ensure subjects and goals are properly selected

## 📊 Sample Test Cases

### **Test Case 1: Grade 8 Student**
```
Profile: Grade 8, Mathematics + Science, BECE preparation
Topic: Photosynthesis
Expected: Beginner-intermediate level, Ghana examples (e.g., local plants), BECE-focused content
```

### **Test Case 2: Grade 11 Student**  
```
Profile: Grade 11, All subjects, WASSCE preparation
Topic: Quadratic Equations
Expected: Intermediate-advanced level, Ghana context (e.g., local business applications), WASSCE prep
```

### **Test Case 3: University-Bound Student**
```
Profile: Grade 12, Physics + Chemistry, University prep
Topic: Chemical Bonding
Expected: Advanced level, Ghana examples (e.g., local industries), university preparation focus
```

## 🎉 Success Indicators

You'll know the demo is working correctly when:

1. ✅ **Profile data is displayed** in the demo interface
2. ✅ **Generated content difficulty** matches your grade level
3. ✅ **Subject references** appear in relevant content
4. ✅ **Study tips** align with your goals
5. ✅ **Content quality** is appropriate for your academic level
6. ✅ **Ghana context** is included in examples and references
7. ✅ **Curriculum alignment** with Ghana Education Service standards
8. ✅ **Error handling** works gracefully

## 🔧 Development Notes

- The demo uses the `profileAwareAI` service
- Content generation includes multiple fallback levels
- Profile data is loaded from localStorage
- All AI requests include personalized context

Happy testing! 🚀
