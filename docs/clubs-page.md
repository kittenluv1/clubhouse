# Clubs Page

Allows users to search clubs by name, or filter clubs by category. The logic is centralized through `SearchContext` so that search bar, filter, and URL information stays consistent.

## Search

- Searches for clubs by partial match on club name.
- **URI:** Dynamically displays results on `/clubs?optional-query-string-for-filter`
  - `/clubs/[id]` is reserved for individual club pages
- Searching **overrides any existing filters** (clears tags)

## Search by Category / Filter

### Vocabulary

| Term           | Description                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Groups**     | High-level groupings like "Academic & Pre-Professional", "Cultural & Identity-Based", etc. Created by Clubhouse for organization purposes. Each group includes related categories. |
| **Categories** | Come from the SOLE API. Also displayed on the landing page.                                                                                                                        |
| **Tags**       | The UI component that shows selectable categories. Implemented in `TagButton.js`. Also displayed on club pages.                                                                    |

## Override Behavior

- Searching for a club in the search bar **clears selected tags**
- Selecting tags **clears any existing search query** and overrides any existing search results

## Notes

- "Club Sports" clubs had their second category renamed to "Sports", since the original second category was just the sport's name (which is already covered by the club name)
