# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.core.management.base import BaseCommand
from collections import OrderedDict
import xlrd,os,json



class Command(BaseCommand):
    def handle(self, *args, **options):
        resources_path = u'./resources'
        workbook = xlrd.open_workbook(os.path.join(resources_path,u'历史事件.xlsx'))
        sheet = workbook.sheet_by_index(0)
        fields = OrderedDict()
        head_row = sheet.row(0)
        for i in range(0, sheet.ncols):
            cell = head_row[i]
            if cell.ctype == xlrd.XL_CELL_TEXT:
                fields[head_row[i].value]=i

        records=[]
        for i in range(1,sheet.nrows):
            row=sheet.row(i)
            row_data = OrderedDict()
            for field in fields:
                field_index=fields[field]
                row_data[field]=row[field_index].value
            records.append(row_data)
        print('[info]\t读取记录%d条' % (len(records)))
        json_str = json.dumps(records, ensure_ascii=False, indent=4)
        json_path = os.path.join(resources_path, u'历史事件.json')
        json_file=open(json_path,'w')
        json_file.write(json_str.encode('utf-8'))
        
        print('[info]\t写入文件[%s]' % (json_path))
        print('[info]\t结束\n')
