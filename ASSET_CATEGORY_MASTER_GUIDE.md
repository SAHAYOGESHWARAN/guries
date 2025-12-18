# Asset Category Master - User Guide

## Quick Start

### Accessing the Feature
1. Open the Marketing Control Center application
2. Look for the sidebar navigation on the left
3. Scroll to the "Master Tables" section
4. Click on **"Asset Category Master"**

## Interface Overview

### Main Screen Components

#### Header Section
- **Title**: "Asset Category Master"
- **Description**: "Configure asset categories by brand with word count specifications."
- **Action Buttons**:
  - **Export**: Download current filtered data as CSV
  - **Add Asset Category**: Open form to create new category

#### Filter Section
- **Search Box**: Filter categories by name (real-time search)
- **Brand Dropdown**: Filter by specific brand
  - All Brands (default)
  - Pubrica
  - Stats work
  - Food Research lab
  - PhD assistance
  - tutors India

#### Data Table
Displays all asset categories with the following columns:
1. **Brand** - Color-coded badge showing the brand
2. **Asset Category Name** - The category name
3. **Word Count** - Target word count for this category
4. **Status** - Active/Inactive badge
5. **Updated** - Last update date
6. **Actions** - Edit and Delete buttons

## Creating a New Asset Category

### Step-by-Step Process

1. **Click "Add Asset Category"** button in the top-right corner

2. **Fill in the Form**:
   
   **Brand** (Required)
   - Select from dropdown:
     - Pubrica
     - Stats work
     - Food Research lab
     - PhD assistance
     - tutors India
   - Default: Pubrica

   **Asset Category Name** (Required)
   - Enter a descriptive name
   - Examples:
     - "What Science Can Do"
     - "How To Guide"
     - "Case Studies"
     - "Product Features"
   - Must be unique (no duplicates allowed)

   **Word Count** (Optional)
   - Enter target word count
   - Default: 0
   - Examples: 500, 1000, 1500

   **Status** (Optional)
   - Select: Active or Inactive
   - Default: Active

3. **Click "Submit"** button

4. **Confirmation**:
   - The new category appears in the table immediately
   - Success notification (if enabled)
   - Modal closes automatically

## Editing an Existing Category

1. **Locate the Category**:
   - Use search or filters to find the category
   - Or scroll through the table

2. **Click "Edit"** button in the Actions column

3. **Modify Fields**:
   - Update any field as needed
   - All fields are editable

4. **Click "Submit"** to save changes

5. **Confirmation**:
   - Changes reflect immediately in the table
   - Updated timestamp refreshes

## Deleting a Category

1. **Locate the Category** you want to delete

2. **Click "Del"** button in the Actions column

3. **Confirm Deletion**:
   - A confirmation dialog appears
   - Click "OK" to confirm
   - Click "Cancel" to abort

4. **Result**:
   - Category is removed from the table immediately
   - Cannot be undone (permanent deletion)

## Filtering and Searching

### Search by Name
- Type in the search box at the top
- Results filter in real-time as you type
- Searches within category names
- Case-insensitive

### Filter by Brand
- Click the brand dropdown
- Select a specific brand
- Table shows only categories for that brand
- Select "All Brands" to clear filter

### Combined Filtering
- Use both search and brand filter together
- Example: Search "guide" + Filter "Pubrica"
- Shows only Pubrica categories containing "guide"

## Exporting Data

1. **Apply Filters** (optional):
   - Filter by brand
   - Search for specific categories
   - Export will include only filtered results

2. **Click "Export"** button

3. **Download**:
   - CSV file downloads automatically
   - Filename: `asset_category_master_export.csv`
   - Contains all visible columns

4. **Use Cases**:
   - Reporting
   - Backup
   - Analysis in Excel/Google Sheets
   - Sharing with team members

## Brand Color Coding

Each brand has a unique color for easy identification:
- **Pubrica**: Blue badge
- **Stats work**: Purple badge
- **Food Research lab**: Green badge
- **PhD assistance**: Orange badge
- **tutors India**: Pink badge

## Status Indicators

- **Active**: Green badge - Category is in use
- **Inactive**: Red badge - Category is disabled

## Best Practices

### Naming Conventions
- Use clear, descriptive names
- Be consistent with capitalization
- Examples:
  - ✅ "What Science Can Do"
  - ✅ "How To Guide"
  - ❌ "what science can do" (inconsistent)
  - ❌ "guide" (too vague)

### Word Count Guidelines
- Set realistic word count targets
- Consider content type:
  - Blog posts: 800-1500 words
  - Case studies: 1000-2000 words
  - How-to guides: 500-1000 words
  - Product features: 300-800 words

### Brand Organization
- Keep categories brand-specific
- Don't mix content from different brands
- Use filters to manage brand-specific categories

### Status Management
- Set to "Inactive" instead of deleting
- Inactive categories are hidden from dropdowns
- Can be reactivated later if needed

## Common Use Cases

### 1. Content Planning
- Create categories for different content types
- Set word count targets for each
- Assign to specific brands

### 2. Asset Organization
- Categories appear in asset creation forms
- Help organize content library
- Enable better filtering and search

### 3. Reporting
- Export categories by brand
- Track word count targets
- Monitor category usage

### 4. Multi-Brand Management
- Separate categories per brand
- Brand-specific content strategies
- Consistent categorization across brands

## Troubleshooting

### "Category name already exists"
- Each category name must be unique
- Check if similar category exists
- Use slightly different name or edit existing

### Changes not appearing
- Refresh the page
- Check internet connection
- Verify backend server is running

### Cannot delete category
- Category might be in use by assets
- Check if referenced elsewhere
- Set to "Inactive" instead

## Integration with Other Features

### Asset Management
- Categories appear in asset creation forms
- Used for organizing asset library
- Enable filtering in asset views

### Content Repository
- Categories link to content items
- Help organize content by type
- Support content strategy planning

### Reporting
- Categories used in analytics
- Track content performance by category
- Generate category-specific reports

## Tips and Tricks

1. **Quick Search**: Use keyboard shortcuts to focus search box
2. **Bulk Operations**: Export, modify in Excel, then re-import
3. **Consistent Naming**: Establish naming conventions early
4. **Regular Review**: Periodically review and clean up unused categories
5. **Brand Separation**: Keep brand categories separate for clarity

## Support

For issues or questions:
1. Check this guide first
2. Review the implementation documentation
3. Contact system administrator
4. Check backend logs for errors

## Summary

The Asset Category Master provides a centralized way to:
- ✅ Manage content categories by brand
- ✅ Set word count targets
- ✅ Organize asset library
- ✅ Support multi-brand operations
- ✅ Enable better content planning
- ✅ Improve reporting and analytics

The interface is intuitive, follows the same pattern as other master tables, and integrates seamlessly with the rest of the application.
