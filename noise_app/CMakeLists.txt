cmake_minimum_required(VERSION 2.6)

set(noise_app
    __init__.py
    models.py
    tests.py
    views.py
    ajax.py
    urls.py
)


add_executable(noise_app dummy.cpp ${noise_app})


