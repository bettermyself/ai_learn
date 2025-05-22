import argparse
import os
import glob


#合并多个Markdown文件到一个文件中,python merge_md.py *.md -o output.md

def merge_markdown(input_files, output_file):
    """
    合并多个Markdown文件到一个文件中
    :param input_files: 要合并的文件路径列表
    :param output_file: 合并后的输出文件路径
    """
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for file_path in input_files:
            # 使用文件名作为二级标题
            file_name = os.path.basename(file_path).replace('.md', '')
            outfile.write(f'## {file_name}\n\n')

            # 写入文件内容
            with open(file_path, 'r', encoding='utf-8') as infile:
                content = infile.read()
                outfile.write(content)

            # 添加两个换行分隔不同文件内容
            outfile.write('\n\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Merge multiple Markdown files')
    parser.add_argument('-o', '--output', default='output.md', help='Output file name')
    parser.add_argument('files', nargs='+', help='List of Markdown files to merge')
    args = parser.parse_args()

    # 支持通配符（例如 *.md）
    expanded_files = []
    for f in args.files:
        if '*' in f or '?' in f:
            expanded_files.extend(glob.glob(f))
        else:
            expanded_files.append(f)

    merge_markdown(expanded_files, args.output)
    print(f'Merged {len(expanded_files)} files into {args.output}')