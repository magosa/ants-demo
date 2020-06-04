import random
import time
import traceback
from functools import wraps
import os
import sys
import csv

WRITE_INTERVAL = 100 / 1000
MAX_DATA_COUNT = 200
RATIO_DETH = 30 / 100
id_count = 0
time_stamp = 0.0
deth_counter = 0


def wrapper(func):
    @wraps(func)
    def _func(*args, **keywords):
        try:
            func(*args, **keywords)
        except Exception:
            traceback.print_exc()

    return _func


def MakeTrajectorySample(list, make_num, id=0):
    global id_count, time_stamp
    while make_num:
        data = [0] * 13
        data[0] = time_stamp  # unixtime
        data[1] = id + id_count  # id
        data[2] = random.random() * 15000  # x
        data[3] = random.random() * 10000  # y
        data[4] = random.random() * 100  # z
        data[5] = random.random() * 10  # velocity
        data[6] = random.uniform(-200, 200)  # direction
        data[7] = random.uniform(-15, 15)  # acceleration
        data[8] = random.uniform(-500, 500)  # ang_velocity
        data[9] = random.randrange(3)  # category
        data[10] = str(random.randrange(20)) + '_' + \
            str(random.randrange(15))  # grid_id
        data[11] = '0x00000e00'  # area_id
        data[12] = 0  # size
        list.append(data)
        id_count += 1
        make_num -= 1


def DataUpdate(list):
    global time_stamp
    global deth_counter
    result = []
    time_stamp = float(time.time())
    for data in list:
        data[0] = time_stamp
        ratio = random.random()
        move_len = data[5] * data[6] * 0.2
        data[2] += move_len * ratio
        data[3] += move_len * (1 - ratio)
        data[5] = random.random() * 10
        data[6] = random.uniform(-200, 200)
        if deth_counter < 100:
            result.append(data)
        else:
            if random.random() >= RATIO_DETH:
                result.append(data)
    if deth_counter < 100:
        deth_counter += 1
    else:
        deth_counter = 0
    return result


def Init(file):
    global time_stamp
    list = []
    time_stamp = float(time.time())
    MakeTrajectorySample(list, random.randrange(MAX_DATA_COUNT))
    DistCSV(file, list)
    time.sleep(WRITE_INTERVAL)
    return list


def Update(list):
    global deth_counter
    update_list = DataUpdate(list)
    if random.random() <= RATIO_DETH / 10:
        margin = random.randrange(MAX_DATA_COUNT - len(update_list))
    else:
        margin = 0
    MakeTrajectorySample(update_list, margin)
    return update_list


def DistCSV(file, list):
    writer = csv.writer(file, lineterminator='\n')
    for data in list:
        writer.writerow(data)
    file.flush()


@wrapper
def main():
    base_dir = os.path.abspath(sys.argv[0]).replace(
        os.path.basename(sys.argv[0]), '')
    file = open(base_dir + 'test.csv', 'a+')
    list = Init(file)
    try:
        while True:
            list = Update(list)
            DistCSV(file, list)
            time.sleep(WRITE_INTERVAL)

    except KeyboardInterrupt:
        pass
    file.close()


if __name__ in '__main__':
    main()
