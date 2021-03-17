<p align="center">
  <a href="https://github.com/ctakasakaubc/Minecraft_A-Minecraft_AI_Capstone">
    <img alt="UBC Data Science Addon for Minecraft: Education Edition" src="https://education.minecraft.net/wp-content/uploads/title_slide_2.jpg" height="200" />
  </a>
  <h3 align="center">User-guided data collection, and Data Science Exploration in Minecraft: Education Edition.</h3>
</p>

---

<img alt="Image Showcasing the in-game Minecraft: Education Edition CodeBuilder with our REPL Environment app running inside" src="./Reference_Images/Minecraft_REPL.png" height="400"/>

_Integrate Data Science Lessons Directly Into MEE_

## Quick Start

**❗️Important**: Python 2 is not supported

Install [Python 3.X](https://www.python.org/downloads/)

Install Flask, and several data science libraries with "pip"

```bash
pip install flask websockets jsonlines 
pip install numpy matplotlib pandas sklearn
```

## Lesson Plans

Lessons are written as default Markdown ( .md ) files with several additional syntax rules that allow for "Minecraft data checkpoint" integration. What this means is that you can write an entire lesson in Markdown (or Word / some other word processor, then convert), adding "Minecraft data checkpoints" when needed without worrying about any style conflicts.

__Minecraft data checkpoints__: These checkpoints force the user to complete a certain count of events before they can proceed with the lesson, i.e. `~BlockBroken,5,iron ore~` requires the user to break 5 iron ore blocks before more of the lesson is made available.

### Example Lesson Plan

```markdown
# Determine Optimal Mining Level with "Hierarchical Clustering"

## What You'll Need:

- A mine
- A pick
- 25 minutes

## Data Collection

To create this model, you need to mine some ores! Included with this lesson is some mining data collected by fellow Steves from around the world!

Begin by collecting some data of your own by going into a mine and collecting some coal, iron, gold, and redstone! If you can, mine yourself some diamonds too!

~~~BlockBroken,125~~~

## Creating the Model

Lorem ipsum.. just kidding. Something about how hierarchical clustering is like a tree. It helps visualize how different or similar data is and how we should separate it into groups. This model will tell us exactly how it tells the ores apart (other than by name) so we can then use that logic in-game!

Start by reading in your data:

`
# read in your newly collected data
my_data = update_event_data()

# see how many different types of blocks you mined, and which ones you want to keep
print(my_data...)
...
`
```

A [complete example lesson](lessons/example_lesson/) is included in the repo

## Resources

markdown syntax cheatsheet

minecraft wiki

etc.

## Trouble shooting

## Feedback