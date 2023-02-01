# Mangasee123 Downloader

## Prerequisites

For the Mangasee123 Downloader to work you need to have 7-Zip as Command Line Tool install.
In the way that it is accessible with the command `7z` in the terminal.

## Installation

Download the corresponding binary from the releases page.
On Windows Drop it somewhere where it will be in a folder already covered by PATH like `C:\Windows` or add it manually to PATH.
On Linux make an alias to it or add it to `/bin` or `/usr/bin`.

## Usage / Commands and Arguments

Use it through the terminal like this.

```bash
mangasee-dl <command> [arguments/flags]
```

### Search

The search command will search for "matching" mangas* on Mangasee123 and return a list of the top results. As well as their Index Name used to download.

Basic Usage:

```bash
mangasee-dl search <search-term> [flags]
```

Example:

```bash
mangasee-dl search One Piece

- 1997 One Piece #1077 [ One-Piece ]
- 2014 One Piece Party #3 [ One-Piece-Party ]
- 1997 One Piece - Digital Colored Comics #1004 [ One-Piece-Digital-Colored-Comics ]
```

**The Boxed in Name (`[One-Piece]`) that is the Index Name used by other commands like the donwload command.**

Possible Flags:

| Flag | Description | Default
|-|-|-|
| -l / --limit | Sets the limit of the maximum displayed search results | 5
| -s / --score-threshold | Sets the score threshold for the match rating of the result | 0.05
| -n / --no-metadata | Disables usages of extra metadata to fancy out the search results (if not disabled makes extra request per manga in the result) | -

### Download

The download command will download mangas by their Index Name.

Basic Usage:

```bash
mangasee-dl download <manga-index-name> [flags]
```
