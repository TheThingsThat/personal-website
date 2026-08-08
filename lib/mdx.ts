import rehypeShiki from "@shikijs/rehype";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

type MdxOptions = NonNullable<NonNullable<MDXRemoteProps["options"]>["mdxOptions"]>;

/** Shared MDX compile options.
 *
 *  Highlighting runs entirely at build time: Shiki emits both palettes as
 *  CSS variables on each token (defaultColor: false), and a few lines in
 *  globals.css pick the set matching data-theme. Zero highlighting JS ships
 *  to the client and theme switches recolor instantly. */
export const mdxOptions: MdxOptions = {
  rehypePlugins: [
    [
      rehypeShiki,
      {
        /* The high-contrast GitHub pair: the regular themes' comment gray and
           keyword red sit just under WCAG AA (4.5:1) on the tinted code
           background at code sizes. */
        themes: {
          light: "github-light-high-contrast",
          dark: "github-dark-high-contrast",
        },
        defaultColor: false,
      },
    ],
  ],
};
