import time
import ctypes
import pygetwindow as gw

# Define the target screen dimensions and positions
screens = {
    1: (0, 0, 2560, 1440),
    2: (2560, 0, 2560, 1440),
    3: (5120, 0, 1024, 600),
    4: (6144, 0, 1024, 600),
}

# Define window titles and target screens
titles_screens = {
    "InstructorConsole": 1,
    "InstructorConsoleView": 2,
    "NightVisionView": 3,
    "TSM_II_Product - Unreal Editor": 4
}

def move_window_to_screen(title, screen_number):
    try:
        # Get the window
        target_win = gw.getWindowsWithTitle(title)[0]

        if target_win.isMinimized:
            target_win.restore()

        # Get screen dimensions
        x, y, width, height = screens[screen_number]

        # Check if the window is already in the correct position and size
        if target_win.left == x and target_win.top == y and target_win.width == width and target_win.height == height:
            print(f"Window '{title}' is already in the correct position and size.")
            return

        # Move the window to the desired screen and maximize it
        print(f"Moving '{title}' window to screen {screen_number}.")
        target_win.moveTo(x, y)
        target_win.resizeTo(width, height)
        time.sleep(1)  # Pause briefly to ensure window moves before maximizing
        target_win.maximize()

    except IndexError:
        print(f"Window with title '{title}' not found.")
    except Exception as e:
        print(f"An error occurred while moving '{title}': {e}")

def monitor_windows_for_titles(titles_screens):
    while True:
        for title, screen_number in titles_screens.items():
            move_window_to_screen(title, screen_number)

        time.sleep(5)  # Check every 5 seconds

if __name__ == "__main__":
    print(f"Starting to monitor windows for {list(titles_screens.keys())}...")
    monitor_windows_for_titles(titles_screens)
