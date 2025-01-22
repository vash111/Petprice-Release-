package com.petprice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/{path:[^\\.]*}")
    public String forwardReactRoutes() {
        // 모든 비-API 경로를 index.html로 포워딩
        return "forward:/index.html";
    }
}