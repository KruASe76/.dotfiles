from dataclasses import dataclass
from typing import Iterable

import pydotool
import mouse
import keyboard


WIDTH, HEIGHT = 1920, 1200

DIGIT_POSITIONS = {
    7: (0, 0),
    8: (1, 0),
    9: (2, 0),
    4: (0, 1),
    5: (1, 1),
    6: (2, 1),
    1: (0, 2),
    2: (1, 2),
    3: (2, 2),
}
SMALL_MOVE_STEP = 15  # in pixels
SMALLER_MOVE_STEP = 5
SMALLER_MODIFIER = "shift"

MODIFIERS = ("ctrl", "alt", "alt gr")
MOUSE_LEFT = ("÷", "enter")
MOUSE_MIDDLE = ("×",)
MOUSE_RIGHT = ("-", "+")
MOUSE_POSITION = [str(digit) for digit in range(1, 10)]


@dataclass
class Rect:
    left: int
    top: int
    right: int
    bottom: int

    @property
    def width(self) -> int:
        return self.right - self.left

    @property
    def height(self) -> int:
        return self.bottom - self.top

    @property
    def center(self) -> tuple[int, int]:
        return round((self.left + self.right) / 2), round((self.top + self.bottom) / 2)


def get_new_rect(rect: Rect, digit: int) -> Rect:
    nth_horizontal, nth_vertical = DIGIT_POSITIONS[digit]

    new_rect = Rect(
        round(rect.left + rect.width * nth_horizontal / 3),
        round(rect.top + rect.height * nth_vertical / 3),
        round(rect.left + rect.width * (nth_horizontal + 1) / 3),
        round(rect.top + rect.height * (nth_vertical + 1) / 3),
    )

    return new_rect


def get_small_move_position(digit: int, is_smaller: bool) -> tuple[int, int]:
    nth_horizontal, nth_vertical = DIGIT_POSITIONS[digit]
    step = SMALLER_MOVE_STEP if is_smaller else SMALL_MOVE_STEP

    nth_horizontal -= 1
    nth_vertical -= 1

    return nth_horizontal * step, nth_vertical * step


def get_relative_position(
    current_position: tuple[int, int], target_position: tuple[int, int]
) -> tuple[int, int]:
    return (
        target_position[0] - current_position[0],
        target_position[1] - current_position[1],
    )


def multiple_wait(keys: Iterable[int]) -> None:
    lock = keyboard._Event()

    hotkeys_to_remove = []
    for key in keys:
        remove = keyboard.add_hotkey(
            key, lambda: lock.set(), suppress=False, trigger_on_release=False
        )
        hotkeys_to_remove.append(remove)

    lock.wait()

    for remove in hotkeys_to_remove:
        keyboard.remove_hotkey(remove)


def main() -> None:
    pydotool.init()

    while True:
        multiple_wait(MODIFIERS)

        last_pressed_digit: str | None = None
        current_rect = Rect(0, 0, WIDTH, HEIGHT)
        small_mode = True

        while True:
            raw_key = keyboard.read_event()

            if raw_key.name in MODIFIERS and raw_key.event_type == keyboard.KEY_UP:
                break

            if not raw_key.is_keypad or raw_key.event_type == keyboard.KEY_UP:
                continue

            if last_pressed_digit == raw_key.name:
                current_rect = get_new_rect(current_rect, int(raw_key.name))
                last_pressed_digit = None
                if current_rect.height < SMALL_MOVE_STEP * 2:
                    small_mode = True
            elif raw_key.name in MOUSE_LEFT:
                pydotool.click(pydotool.ClickEnum.LEFT_CLICK)
            elif raw_key.name in MOUSE_MIDDLE:
                pydotool.click(
                    pydotool.ClickEnum.MOUSE_CLICK | pydotool.ClickEnum.MIDDLE
                )
            elif raw_key.name in MOUSE_RIGHT:
                pydotool.click(pydotool.ClickEnum.RIGHT_CLICK)
            elif raw_key.name in MOUSE_POSITION:
                if small_mode:
                    pydotool.mouse_move(
                        get_small_move_position(
                            int(raw_key.name), SMALLER_MODIFIER in raw_key.modifiers
                        ),
                        is_abs=False,
                    )
                else:
                    new_rect = get_new_rect(current_rect, int(raw_key.name))
                    pydotool.mouse_move(
                        get_relative_position(mouse.get_position(), new_rect.center),
                        is_abs=False,
                    )
                    last_pressed_digit = raw_key.name


if __name__ == "__main__":
    main()
