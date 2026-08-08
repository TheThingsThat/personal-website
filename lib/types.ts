/** The single place to add a content type.
 *
 *  Key = the `type` value used in frontmatter; value = the tab label shown in
 *  the feed. Tab order follows map order ("All" is prepended automatically).
 *  Add a line here and the validator, tab bar, and item pages all pick it up.
 */
export const TYPE_LABELS = {
  essay: "Essays",
  code: "Code",
  build: "Builds",
  note: "Notes",
  interest: "Interests",
} as const;

export type ContentType = keyof typeof TYPE_LABELS;

export const CONTENT_TYPES = Object.keys(TYPE_LABELS) as ContentType[];
