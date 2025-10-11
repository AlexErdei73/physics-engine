# Phisics-Engine

This repository is going to implement a simple physics engine for 2D point
mechanics. I am going to use the
[Euler-Richardson algorithm](https://www.physics.udel.edu/~bnikolic/teaching/phys660/numerical_ode/node4.html)
(RK2) for simplicity. The simple animation is going to go on the browser canvas.
The project is going to be part of a mathematics-physics training project for
elementary and secondary school pupils.

## Content

1. [Quick Start Guide](#quick-start-guide)
2. [Sign Up](#sign-up)
3. [Log In](#log-in)
4. [Create Project](#create-project)
5. [Execute Project](#execute-project)
6. [Numeric Results](#getting-numeric-results)
7. [Time Graphs](#getting-time-graphs)

## Quick Start Guide

I recommend first to create an account with your email address form the
[Sign Up](#sign-up) menu. Without creating an account, you still can try the
projects and even modify them, but the modifications are local to your computer.
You also don't get refreshed when someone modifies their projects, unlike with
an account, because the projects get updated whenever you [Log In](#log-in).

After registration, you need to verify your email and you ready to execute the
already existing projects or create your own ones. You are also able to publish
your projects and share them with other members.

To [execute a project](#execute-project) you need to go to the home page, where
you can navigate between projects with the **Next** and **Back** buttons. Chose
your project by clicking on its link then when the page loaded press the
**Start** button. You will see an animation, which is the physics simulation.
You may see the elapsed time and energy values at top-right corner of the
animation window and you can stop it and reset, by the appropriate buttons.

The simulations use metric units (m, kg, s, N, J, etc.) for normal simulations
and astronomical units for the celestial mechanics simulations, which show
planetary orbits around the Sun. For these simulations the unit of time is year
and the unit of distance is the astronomical unit, which is the Sun-Earth mean
distance (about 150 000 000km). The mass unit is the mass of the Sun. In these
units the gravitational constant in Newton's gravity law is about $4\pi^2$ .

You can also see a bunch of check-boxes, which control what it shows in the
animation window. You can turn off/on the time and energy values in the
top-right corner, the unit grid, the force vectors on the bodies and the
trajectories of the bodies.

You can get [numerical results](#numerical-results) by ticking the **Results**
checkbox and you are also able to get [time graphs](#time-graphs) by ticking the
**Graphs** checkbox. The app is able to show 4 different graphs on one page.
First you need to pick the maximum 4 different quantities from the numerical
results by choosing them with the selector and ticking the **Added to graphs**
check-box. You can remove them from the graph from the similar way with
unticking the checkbox.

After the selection, you need to tick the **Graphs** check-box and run the
simulation by clicking the **Start** button. The graph slowly appears as the
time elapses.

![projects page](./images/project.png)

To [create a project](#create-project) you need to click the **Create** menu in
the top navigation and it opens the page. Here you can edit the current project
or press the **Create** button to create a new one. This leads to an empty world
with some predefined values, which are appropriate for most normal simulation
projects.

![create page scrolled to top](./images/create1.png)
![create page scrolled to bottom](./images/create2.png)

You can create new points from the points part with the New button and delete
them with the Delete button. All the points have an associated number (index)
and changing that, we can navigate between the mass points (bodies). We can also
edit the parameters of the point, with the given index. The **Point fixed**
checkbox creates fixed points, which cannot move at all.

The coordinates are in length units and the top-left corner of the simulation
window is always the origin. When the x position is growing the point moves to
the right, when y is growing it is moving down. The gravity of Earth is pointing
down to the y direction.

> **Caution:** The default value for g is 0, so there is no gravity. You must
> give the 9.8 parameter for g for normal simulations.

The rod is a stiff spring. You can create them by the **New** button delete them
by the **Delete** button, similarly to points. You can adjust the stiffness and
dumping of these. You also need to specify the indexes of the end points, which
the rod connects. All rods have their own index and by ticking the **Is spring**
checkbox the graphics will remind for a spring during the simulation.

From these elements you can build complex simulations. You can also create
periodic force, which effects some point to simulate resonance phenomenons. The
frequency of this force can be adjusted between the minimum and maximum value by
the range input on the project page meanwhile you are executing the simulation.

At the end give a name to the project and a short text description mainly for
accessible users, who may not be able to see the animations. Do not forget to
press the **Save** button to save the new project.

You can publish your project for the other registered users with ticking the
**Published** checkbox.

> **Caution:** You may get error messages if you are not logged in. The browser
> still saves into local storage, but this gets overwritten if you log in to
> your account.

### Sample Project I

The period of the mathematical pendulum is independent of its amplitude for
small amplitudes. What is happening to the period if the amplitude grows and not
small at all?

To answer this question and practice a bit all of the above, I will make a
sample project. We will make two mathematical pendulums, which can hang
independently and we can show and compare their x position, depending the time.
This way we can answer the question.

1. Let's log in to our account.
2. Create a new project (Navigate to create page, press **Create** button)
3. Do not forget to set g to $9.8m/s^2$
4. Create a fixed point to hang the pendulum(s) at x=3m y=0 position (Press
   **New** at points, tick **Fixed point** checkbox, fill in x and y)
5. Create a mass point at the x=3m y=3m position and let's give it vx=0.1m/s
   vy=0 initial velocity. The m should be 0.1kg (Similar like previously without
   ticking the checkbox)
6. Connect the two points (index=0 and 1) with a new rod (Press **New** button
   at rods, make sure elasticity = 10000, beta=100, point1 is 0 and point2 is 1
   and length=3m, the **Is spring** checkbox is unticked)
7. Fill in the title and text description and press **Save** button
8. Run it (Navigate to project page, press **Start**) It should be hanging
   nicely with tiny amplitude
9. Press **Stop** button and navigate back to the create page
10. Create another mass point at x=3m, y=3m position with the same m=0.1kg mass.
    This has index 2. The vx=5m/s vy=0 are the initial velocity.
11. Add another rod, which connects the points with 0 and 2 indexes. So
    point1=0, point2=2, elasticity=10000, beta=100, length=3m.
12. Run it again the same way like in 8. The two pendulum is not hanging
    perfectly synchronously.
13. Press **Stop** button and tick **Results** checkbox
14. New surface appears, navigate to point index 1, choose x position and tick
    **Added to graphs** checkbox
15. Do the same like in 14. but this time with point index 2
16. Press **switch back** button to make this surface disappear
17. Press **Reset** button to reset the simulation
18. Tick the **Graphs** checkbox
19. Press **Start** button, the graph should appear slowly. It's clear from the
    graph that the pendulum with the large amplitude has slightly bigger period.
    This answers the question, so the period of the mathematical pendulum grows
    with the amplitude.

### Sample Project II

There is an incline, which has 30degrees with the horizontal direction. How far
the mass point goes on the incline when its initial speed is 3m/s? How high it
gets when it turns back? How much is the magnitude of its acceleration and the
sum of the forces effect it? How much is the normal force? The friction is
negligible.

Let's first do a calculation and we can verify it by a simulation. The result
does not depend on the mass of the body, let's choose m=0.1kg for simplicity.
The sum of forces is:\

$$
F=mgsin\alpha
$$

In this case it's:\

$$
F = 0.1kg \times9.81m/s^2\times sin 30=0.4905N
$$

The magnitude of acceleration:\

$$
F = ma
$$

$$
a=F/m=0.4905N/0.1kg=4.905m/s^2
$$

The time of deceleration is the same as the time of acceleration, so\

$$
a = |\Delta v|/t
$$

$$
t=|\Delta v|/a=v/a=\frac{3m/s}{4.905m/s^2}=0.61162s
$$

The length of path during this time\

$$
s=a/2\times t^2 = 4.905m/s^2/2\times (0.61162s)^2=0.9174m
$$

The achieved height is\

$$
h = s\times sin\alpha = 0.9174 \times 0.5 = 0.4587m
$$

We should get these details from a simulation too. Let's make the simulation.
The first endpoint of the incline will be x0=1m and y0=3m. Let's choose the
length of the incline l=2m. Let's calculate the other endpoint:\

$$
x_1 = x_0 + l\times cos\alpha = 1m + 2m \times cos 30 = 2.732051m
$$

$$
y_1 = y_0 -l\times sin\alpha = 3m - 2m \times sin 30 = 2m
$$

Now we calculate the position of the mass point at the start, when its radius =
0.1m.\

$$
x_2 = x_0 - r \times sin\alpha = 1m - 0.1m\times sin30 = 0.95m
$$

$$
y_2 = y_0 - r \times cos\alpha = 3m - 0.1m\times cos30 = 2.9134m
$$

We also need to calculate the component of the initial velocity:\

$$
v_x = v_0 \times cos \alpha = 3m/s \times cos 30 = 2.598076m/s
$$

$$
v_y = v_0\times sin\alpha = 3m/s\times sin30 = 1.5m/s
$$

Now we have all the details for making the simulation.

1. Create a new project (Choose **Create** menu at top bar then press **Create**
   button)
2. Add 9.81 to g
3. Press the **New** button at points to create the bottom point of the incline.
   Set x=1 and y=3 then tick **Point fixed** checkbox.
4. Press the **New** button again to create the top point of the incline. Set
   x=2.732051 and y=2 then tick **Point fixed** checkbox again.
5. Now press the **New** button at rods to create the actual incline. Make sure
   it has point1=0 and point2=1, so it connects the previous points. The
   length=2 and elasticity=10000 and beta=100.
6. Press **New** button again at points to create the sliding mass point. Set
   m=0.1 x=0.95 y=2.9134 and tick **Is path visible** checkbox to show the path.
   Set vx=2.598076 and vy=-1.5. vy must be negative, because the point goes up
   but y grows downwards.
7. Name the project and write a short text description.
8. Tick the **show time**, **show grid**, **show force** and **show energy**
   checkboxes to see more data during the simulation.
9. Do not forget to tick the **body-rod collision on** checkbox. This makes
   sure, that the point won't ignore the incline, so the system calculates the
   forces between them. Make sure that **collision k** parameter is 10000 and
   **point-rod coll. beta** is 100. These are the elasticity and damping
   constants of the collision between the rod and the mass point.
10. Click the **project** link in the top bar and the **Start** button to run
    the simulation. It runs quite fast.

> **Tip** The project runs quite fast, but we can slow it down by changing the
> **dt** and **anim time** parameters in the same ratio. If for example we
> choose dt=1e-7 and anim time=0.0003333333333 it slows down everything 100
> times. We should keep the ratio of these parameters the same as the original
> setup was.

11. Now we can get some graphs. Press **Stop** button and **Reset** button then
    tick the **Results** checkbox.
12. Choose index 2 for the point then select **path length** and tick **Added to
    graphs** checkbox.
13. Select **v** then tick **Added to graphs** checkbox again
14. Click **switch back** button and tick **Graphs** checkbox then click the
    **Start** button to get the graphs. We get the below graph:

![s and v in function of time](./images/sv-tgraphs.png)

The red curve is the path length, which changes very slowly around the time,
when the body turns its direction of movement. The green v-shaped line is the
speed. It goes down to zero and up when the body goes back to its original
position. The turning point is when v=0. We see that the values, what we can
read from the graph are in consistency with our calculation, although graph
readings have limited accuracies.

15. Untick the **Graphs** checkbox then press **Reset** and **Start**
16. Press **Stop** when the time is 0.611 roughly
17. Tick **Results** checkbox and choose 2 for point index. The sliding point is
    red now, which means it's selected and we can see its numerical values.
    Thepath length=0.9174, a=4.905 and v is nearly 0 in full agreement with our
    calculations. We can read y=2.4548.

/

$$
h=|\Delta y| = |y - y_0| = |2.4548 - 2.9134| = 0.4586m
$$

This is again in full agreement with our calculations.
