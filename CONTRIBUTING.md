# Contributing to Divergent Flow

First off, thank you for considering contributing to Divergent Flow. It's people like you that make open source such a great community.

## Where do I go from here?

If you've noticed a bug or have a feature request, [make one](https://github.com/jgsteeler/divergent-flow-core/issues/new/choose)! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

### Fork & create a branch

If this is something you think you can fix, then [fork the repository](https://github.com/jgsteeler/divergent-flow-core/fork) and create a branch with a descriptive name.

A good branch name would be (where issue #123 is the ticket you're working on):

```sh
git checkout -b 123-fix-bug-description
```

### Get the test suite running

Make sure you're able to run the test suite locally. You can do this by running:

```sh
npm install
npm test
```

### Implement your fix or feature

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first 😸

### Make a Pull Request

At this point, you should switch back to your main branch and make sure it's up to date with the latest upstream version of the repository.

```sh
git remote add upstream git@github.com:jgsteeler/divergent-flow-core.git
git checkout main
git pull upstream main
```

Then update your feature branch from your local copy of main, and push it!

```sh
git checkout 123-fix-bug-description
git rebase main
git push --force-with-lease origin 123-fix-bug-description
```

Finally, go to GitHub and make a Pull Request.

## Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

To learn more about rebasing and merging, check out this guide on [merging vs. rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing).

## How to get help

If you're having trouble, you can ask for help in a GitHub issue.
