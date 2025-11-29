from collections.abc import Iterable
from dataclasses import dataclass
from threading import Event

import keyboard
import mouse
import pydotool
import schedule

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

MODIFIERS = (29, 97, 56, 100)  # left ctrl, right ctrl, left alt, right alt (alt gr)
MOUSE_LEFT = (98, 96, 76)  # "/", "numpad_enter", "5"
MOUSE_MIDDLE = (55,)  # "*"
MOUSE_RIGHT = (74, 78)  # "-", "+"
MOUSE_POSITION = (79, 80, 81, 75, 77, 71, 72, 73)  # all digits except "5"


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

    return Rect(
        round(rect.left + rect.width * nth_horizontal / 3),
        round(rect.top + rect.height * nth_vertical / 3),
        round(rect.left + rect.width * (nth_horizontal + 1) / 3),
        round(rect.top + rect.height * (nth_vertical + 1) / 3),
    )


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


class _CustomEvent(Event):
    def wait(self, _timeout: float | None = None) -> None:
        while True:
            schedule.run_pending()

            if super().wait(0.5):
                break


def multiple_wait(keys: Iterable[str | int]) -> None:
    lock = _CustomEvent()

    hotkeys_to_remove = []
    for key in keys:
        hotkeys_to_remove.append(
            keyboard.add_hotkey(
                key, lambda: lock.set(), suppress=False, trigger_on_release=False
            )
        )

    lock.wait()

    for hotkey in hotkeys_to_remove:
        keyboard.remove_hotkey(hotkey)


def main() -> None:
    pydotool.init()

    mouse_flag = False

    def reset_mouse_flag() -> type[schedule.CancelJob]:
        nonlocal mouse_flag
        mouse_flag = False

        return schedule.CancelJob

    for key in MOUSE_LEFT:
        keyboard.add_hotkey(key, lambda: mouse_flag and pydotool.click(pydotool.ClickEnum.LEFT_CLICK))

        for modifier in MODIFIERS:
            keyboard.add_hotkey((modifier, key), lambda: mouse_flag and pydotool.click(pydotool.ClickEnum.LEFT_CLICK))

    for key in MOUSE_MIDDLE:
        keyboard.add_hotkey(key, lambda: mouse_flag and pydotool.click(pydotool.ClickEnum.MOUSE_CLICK | pydotool.ClickEnum.MIDDLE))

        for modifier in MODIFIERS:
            keyboard.add_hotkey((modifier, key), lambda: mouse_flag and pydotool.click(pydotool.ClickEnum.MOUSE_CLICK | pydotool.ClickEnum.MIDDLE))

    for key in MOUSE_RIGHT:
        keyboard.add_hotkey(key, lambda: mouse_flag and pydotool.click(pydotool.ClickEnum.RIGHT_CLICK))

        for modifier in MODIFIERS:
            keyboard.add_hotkey((modifier, key), lambda: mouse_flag and pydotool.click(pydotool.ClickEnum.RIGHT_CLICK))

    while True:
        multiple_wait(MODIFIERS)

        last_pressed_digit_code: int | None = None
        current_rect = Rect(0, 0, WIDTH, HEIGHT)
        small_mode = True
        mouse_flag = True

        while True:
            raw_key = keyboard.read_event()

            if raw_key.scan_code in MODIFIERS and raw_key.event_type == keyboard.KEY_UP:
                # small_mode = False
                schedule.every(1).seconds.do(reset_mouse_flag)
                break

            if not raw_key.is_keypad or raw_key.event_type == keyboard.KEY_UP:
                continue

            if last_pressed_digit_code == raw_key.scan_code:
                current_rect = get_new_rect(current_rect, int(raw_key.name))
                last_pressed_digit_code = None
                if current_rect.height < SMALL_MOVE_STEP * 2:
                    small_mode = True
            elif raw_key.scan_code in MOUSE_POSITION:
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
                    last_pressed_digit_code = raw_key.scan_code


if __name__ == "__main__":
    main()
