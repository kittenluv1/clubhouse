# Clubs Page

## Search

- Displays all clubs matching a **partial search** on club name and category
- **URI:** Dynamically displays results on `/clubs?optional-query-string-for-filter`
  - `/clubs/[id]` is reserved for individual club pages
- Searching **overrides any existing filters** (clears tags)

## Search by Category / Filter

- Implemented in the `Filter.js` component

### Vocabulary

| Term | Description |
|------|-------------|
| **Groups** | High-level groupings like "Academic & Pre-Professional", "Cultural & Identity-Based", etc. Created by Clubhouse for organization purposes. Each group includes related categories. |
| **Categories** | Come from the SOLE API. Also displayed on the landing page. |
| **Tags** | The UI component that shows selectable categories. Implemented in `TagButton.js`. Also displayed on club pages. |

### Override Behavior

- Searching for a club in the search bar **clears selected tags**
- Selecting tags **clears any existing search query**
- Search by category currently overrides any existing search results

## Notes

- "Club Sports" clubs had their second category renamed to "Sports", since the original second category was just the sport's name (which is already covered by the club name)
