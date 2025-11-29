import math
import os
import subprocess
import time

import keyboard
import mouse
import pydotool

# combination: ctrl+x, esc, esc

first_timeout = 0.3
second_timeout = 0.2
command = [
    "gnome-terminal",
    "--full-screen",
    "--hide-menubar",
    "--",
    "cmatrix",
    "-b",
]

sudo_user = os.getenv("SUDO_USER") or "root"
last_ctrl_x_press_time = -math.inf
last_esc_press_time = -math.inf
more_than_screen_size = (10_000, 10_000)

pydotool.init()


def get_relative_position(
    current_position: tuple[int, int], target_position: tuple[int, int]
) -> tuple[int, int]:
    return (
        target_position[0] - current_position[0],
        target_position[1] - current_position[1],
    )


def move_mouse_away() -> None:
    pydotool.mouse_move(
        get_relative_position(mouse.get_position(), more_than_screen_size),
        is_abs=False,
    )


def on_ctrl_x() -> None:
    global last_ctrl_x_press_time

    last_ctrl_x_press_time = time.monotonic()


def on_esc() -> None:
    global last_esc_press_time, last_ctrl_x_press_time

    current_time = time.monotonic()

    if (
        last_esc_press_time - last_ctrl_x_press_time <= first_timeout
        and current_time - last_esc_press_time <= second_timeout
    ):
        subprocess.run(["sudo", "-u", sudo_user, *command])  # noqa: S603, S607
        move_mouse_away()

    last_esc_press_time = current_time


keyboard.add_hotkey("ctrl+x", on_ctrl_x)
keyboard.add_hotkey("esc", on_esc)

keyboard.wait()
