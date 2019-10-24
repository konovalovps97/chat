package com.example.demo.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedList;

@Controller
public class MainController {

    private static LinkedList<String> onlineUsers = new LinkedList<>();

    @RequestMapping("/")
    public String index(HttpServletRequest request, Model model) {
        String username = (String) request.getSession().getAttribute("username");

        if (username == null || username.isEmpty()) {
            return "redirect:/login";
        }
        model.addAttribute("username", username);
        return "chat";
    }

    @RequestMapping(path = "/login", method = RequestMethod.GET)
    public ModelAndView  showLoginPage(HttpServletRequest request) {
        ModelAndView modelAndView = new ModelAndView();
        if (request.getSession().getAttribute("username") != null) {
            modelAndView.setViewName("chat");
        }
        modelAndView.setViewName("login");
        return modelAndView;
    }

    @RequestMapping(path = "/login", method = RequestMethod.POST)
    public String doLogin(HttpServletRequest request, @RequestParam(defaultValue = "") String username) {
        username = username.trim();

        if (username.isEmpty()) {
            return "login";
        }
        if (request.getSession().getAttribute("username") != null) {
            request.getSession(false).invalidate();
            request.getSession(true);
        }
        request.getSession().setAttribute("username", username);

        onlineUsers.addLast(username);
        return "redirect:/";
    }

    @RequestMapping(path = "/logout/{username}")
    public String logout(HttpServletRequest request, @PathVariable(required = false) String username) {

        onlineUsers.remove(username);
        request.getSession(true).invalidate();

        return "redirect:/login";
    }

    @GetMapping(path = "onlineUsers")
    public ResponseEntity<LinkedList<String>> getOnlineUsers() {
        return ResponseEntity.ok(onlineUsers);
    }
}