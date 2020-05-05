import re
import toml


def toml_break_line(line):
    m = re.match(r"^other = \"(.+?)\"$", line)
    if not m:
        return [line]

    splits = m.group(1).replace(r"\n", "\n").splitlines()
    if len(splits) == 1:
        return [line]

    lines = []
    lines.append('other = """' + splits[0])
    lines.extend(splits[1:])
    lines[-1] = lines[-1] + '"""'

    return lines


def toml_dump(obj, stream):
    for line in toml.dumps(obj).splitlines():
        for l in toml_break_line(line):
            stream.write(l)
            stream.write("\n")
