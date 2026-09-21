#!/bin/bash
export PYTHONPATH=$PYTHONPATH:.
uvicorn app.main:app --reload --port 8000
