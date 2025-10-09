# Phisics-Engine
This repository is going to implement a simple physics engine for 2D point mechanics. I am going to use the Euler-Richardson algorithm (RK2) for simplicity. The simple animation is going to go on the browser canvas. The project is going to be part of a mathematics-physics training project for elementary and secondary school pupils.
## Content
1. [Quick Start Guide](#quick-start-guide)
2. [Sign Up](#sign-up)
3. [Log In](#log-in)
4. [Create Project](#create-project)
5. [Execute Project](#execute-project)
6. [Numeric Results](#getting-numeric-results)
7. [Time Graphs](#getting-time-graphs)
## Quick Start Guide
I recommend first to create an account with your email address form the [Sign Up](#sign-up) menu. Without creating an account, you still can try the projects and even modify them, but the modifications are local to your computer. You also don't get refreshed when someone modifies their projects, unlike with an account, because the projects get updated whenever you [Log In](#log-in).

After registration, you need to verify your email and you ready to execute the already existing projects or create your own ones. You are also able to publish your projects and share them with other members.

To [execute a project](#execute-project) you need to go to the home page, where you can navigate between projects with the next and back buttons. Chose your project by clicking on its link then when the page loaded press the start button. You will see an animation, which is the physics simulation. You may see the elapsed time and energy values at top-right corner of the animation window and you can stop it and reset, by the appropriate buttons.

The simulations use metric units (m, kg, s, N, J, etc.) for normal simulations and astronomical units for the celestial mechanics simulations, which show planetary orbits around the Sun. For these simulations the unit of time is year and the unit of distance is the astronomical unit, which is the Sun-Earth mean distance (about 150 000 000km). The mass unit is the mass of the Sun. In these units the gravitational constant in Newton's gravity law is about $4\pi^2$ .

You can also see a bunch of check-boxes, which control what it shows in the animation window. You can turn off/on the time and energy values in the top-right corner, the unit grid, the force vectors on the bodies and the trajectories of the bodies.

You can get [numerical results](#numerical-results) by ticking the
Results checkbox and you are also able to get [time graphs](#time-graphs) by ticking the Graphs checkbox. The app is able to show 4 different graphs on one page. First you need to pick the maximum 4 different quantities from the numerical results by choosing them with the selector and ticking the add to graph check-box. You can remove them from the graph from the similar way with unticking the checkbox.

After the selection, you need to tick the Graphs check-box and run the simulation by clicking the start button. The graph slowly appears as the time elapses.

![projects page](./images/project.png)