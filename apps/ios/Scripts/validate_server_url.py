#!/usr/bin/env python3
"""Validate the resolved build default, not the user-entered server override."""
import ipaddress
import os
import re
import sys
from urllib.parse import urlsplit


def valid_origin(value: str) -> bool:
    if not value or any(c.isspace() or ord(c) < 32 for c in value) or any(c in value for c in "\\$%"):
        return False
    try:
        url = urlsplit(value)
        if (url.scheme != "https" or not url.netloc or url.username is not None or
                url.password is not None or url.path not in ("", "/") or
                url.query or url.fragment or "?" in value or "#" in value):
            return False
        # urlsplit accepts characters after a closing IPv6 bracket; validate
        # the complete authority before relying on its parsed host and port.
        if not re.fullmatch(r"(?:\[[^\[\]]+\]|[^:\[\]@]+)(?::[0-9]+)?", url.netloc):
            return False
        host, port = url.hostname, url.port
        if not host or (port is not None and not 1 <= port <= 65535):
            return False
        if url.netloc.endswith(":"):
            return False
        if url.netloc.startswith("["):
            ipaddress.IPv6Address(host)
        elif len(host) > 253 or any(not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?", label) for label in host.split(".")):
            return False
        return True
    except ValueError:
        return False


if __name__ == "__main__":
    if not valid_origin(os.environ.get("CONFETTI_SERVER_URL", "")):
        print("error: CONFETTI_SERVER_URL must be a resolved HTTPS origin with an optional port and no path", file=sys.stderr)
        sys.exit(1)
