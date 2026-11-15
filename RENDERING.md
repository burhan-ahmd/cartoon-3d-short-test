# Rendering and source provenance

This new project reuses **Remotion + Three.js and the character drawing API** by copying the required files from:

`E:\2026\EssouliAnas_animation_coldframe\render-repo\claude-animated-coldframe\studio`

The original animation repo is a read-only source. No edits, commits, or pushes are made there. The copied source lives under this repository's `studio/` folder and the new composition is authored independently; it does not import or register any prior video/test composition. The new composition, cast, layout, soundtrack, asset list, and workflow are authored for this repository.

Cloud renders use the same **Coldframe GitHub Actions reusable workflow** as the original project (`Razee4315/coldframe/.github/workflows/render.yml@v1`), configured for software WebGL (`swangle`) on distributed GitHub Actions runners. This new repo has its own workflow and public repository so the original repo's workflow/code need not be changed. Render outputs are downloaded to `results/`.

The cloned skill source at the repository root documents the creative pipeline (`SKILL.md`). This project follows its story/style guidance, uses the repository's Polyfork catalog for set dressing, and creates an original deterministic procedural score/SFX mix. No voiceover is used for this silent 10-second film, so there are no captions.

The original project's exact cloud-render instructions are in `INSTRUCTIONS.md` in the source path above. Its environment's temporary/uncommitted work is not copied.
