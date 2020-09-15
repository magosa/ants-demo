import os
import sys
import time
import traceback
from functools import wraps
from os.path import dirname
from socketIO_client_nexus import SocketIO
from watchdog.events import FileSystemEventHandler, FileCreatedEvent
from watchdog.observers.polling import PollingObserver
import json
from collections import OrderedDict
# ファイル読み込みインターバル
READ_INTERVAL = 200 / 1000

# WebSocket サーバ
socketIO = SocketIO('localhost', 8080)
socket = 'current_data'


def wrapper(func):
    @wraps(func)
    def _func(*args, **keywords):
        try:
            func(*args, **keywords)
        except Exception:
            traceback.print_exc()

    return _func


def send_data(data):
    # print(json.dumps(data))
    socketIO.emit(socket, json.dumps(data))


def MakeTrajectoryData(columns):
    if int(columns[9]) == 2:
        data = OrderedDict()
        data["unixtime"] = float(columns[0])
        data["id"] = int(columns[1])
        data["x"] = float(columns[2])
        data["y"] = float(columns[3])
        data["z"] = float(columns[4])
        data["velocity"] = float(columns[5])
        data["direction"] = float(columns[6])
        data["acceleration"] = float(columns[7])
        return data


class TailHandler(FileSystemEventHandler):
    """
    指定ファイルの更新イベントをハンドルし表示します。
    新しいファイルが作成されたときそれを検知します。
    Reference: https://qiita.com/t2y/items/ef66c871731bddd8ef1d
    """

    def __init__(self, path):
        self.path = path

    def setup(self, path):
        self.path = path

    def on_created(self, event):
        if type(event) == FileCreatedEvent:
            # この新しく作成されたファイルが該当ファイルであることをチェック or 保証できればファイルを read し直すと良さそう
            print('Change file: ', event.src_path)
            self.setup(event.src_path)

    def on_modified(self, event):
        if event.is_directory or self.path != event.src_path:
            return


def tail_like(path):
    observer = PollingObserver()
    handler = TailHandler(path)
    observer.schedule(handler, dirname(path))
    observer.start()
    current_path = path
    # 末尾へ seek
    current_pos = os.stat(path)[6]
    current_file = open(path, 'r')
    try:
        buffer = []
        old_unix_time = 0

        while True:

            current_file.seek(current_pos)
            data = ''

            for block in iter(lambda: current_file.read(32), ''):
                data += block

            current_pos = current_file.tell()

            if current_path != handler.path:
                print('change path')
                current_path = handler.path
                current_pos = os.stat(current_path)[6]
                current_file = open(current_path, 'r')

            if data == '':
                continue

            rows = data.split('\n')

            for row in rows:

                columns = row.split(',')
                unix_time = columns[0]

                if row == '':
                    pass
                elif unix_time != '' and old_unix_time == 0:
                    pass
                elif float(unix_time) > old_unix_time:
                    send_data(buffer)
                    old_unix_time = float(unix_time)
                    # print(buffer)
                    buffer = []
                    buffer.append(MakeTrajectoryData(columns))
                else:
                    buffer.append(MakeTrajectoryData(columns))

                if unix_time != '':
                    old_unix_time = float(unix_time)

            time.sleep(READ_INTERVAL)

    except KeyboardInterrupt:
        observer.stop()
    finally:
        handler.close()
    observer.join()


@wrapper
def main():
    global web_socket_wrapper
    if len(sys.argv) < 2:
        print('invalid arguments. specified csv full path.')
        return
    path = sys.argv[1]
    if not os.path.exists(path):
        print("No such file exist.")
        return

    tail_like(path)


if __name__ in '__main__':
    main()
