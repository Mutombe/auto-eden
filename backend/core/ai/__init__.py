# core/ai/__init__.py
"""
Claude AI integration for Auto Eden.
Provides customer support, vehicle analysis, and content generation.
"""

from .client import claude_client, ClaudeClient

__all__ = ['claude_client', 'ClaudeClient']
